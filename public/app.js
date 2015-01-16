/*
 * jQuery File Upload Plugin Angular JS Example 1.2.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global window, angular */

(function () {
    'use strict';

    var isOnGitHub = window.location.hostname === 'blueimp.github.io',
        url = isOnGitHub ? '//jquery-file-upload.appspot.com/' : 'photo/upload/';

    angular.module('demo', [
        'blueimp.fileupload',
        'ui.bootstrap'
    ])
        .config([
            '$httpProvider', 'fileUploadProvider',
            function ($httpProvider, fileUploadProvider) {
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
                fileUploadProvider.defaults.redirect = window.location.href.replace(
                    /\/[^\/]*$/,
                    '/cors/result.html?%s'
                );
                if (isOnGitHub) {
                    // Demo settings:
                    angular.extend(fileUploadProvider.defaults, {
                        // Enable image resizing, except for Android and Opera,
                        // which actually support image resizing, but fail to
                        // send Blob objects via XHR requests:
                        disableImageResize: /Android(?!.*Chrome)|Opera/
                            .test(window.navigator.userAgent),
                        maxFileSize: 5000000,
                        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
                    });
                }
            }
        ])
        .controller('DemoFileUploadController', 
            function ($scope, $http, $rootScope) {
                $scope.options = {
                    url: url
                };
				$scope.images = $rootScope._files = [];
				$scope.load_data = function() {
					$.ajax({
						type: 'GET',
						url: '/photos/list',
						dataType: 'json'
					}).always(function(response) {
						if (response) {
							$scope.images = response;
							if (!$scope.$$phase)
								$scope.$digest();
						}
					});
				}
				$scope.image_hover = function(id) {
					$.ajax({
						type: 'GET',
						url: '/photos/list/'+id+'/detail',
						dataType: 'json'
					}).always(function(response) {
						if (response) {
							$('#post-'+id+' .cover').attr('title','Width:'+response.width+'px, Height:'+response.height+'px');
						}
					});
				}
				
				$rootScope._state = {
					isFullscreen : false
				}
				$scope.open_slider = function(image) {
				 	$rootScope._files = $scope.images;
					image.type = 'picture';
					$rootScope.$emit('files:open',{
						idx: image._id,
						file: image
					});
				}
				$scope.load_data();
				
				$('#fileupload')
					.bind('fileuploaddone', function (e, data) {
						if (data.result)
							$scope.images.push(data.result);
						return;
					})
					/*
                if (!isOnGitHub) {
                    $scope.loadingFiles = true;
                    $http.get(url)
                        .then(
                            function (response) {
                                $scope.loadingFiles = false;
                                $scope.queue = response.data.files || [];
                            },
                            function () {
                                $scope.loadingFiles = false;
                            }
                        );
                }
					*/
            }
        )
        .controller('FileDestroyController', [
            '$scope', '$http',
            function ($scope, $http) {
                var file = $scope.file,
                    state;
                if (file.url) {
                    file.$state = function () {
                        return state;
                    };
                    file.$destroy = function () {
                        state = 'pending';
                        return $http({
                            url: file.deleteUrl,
                            method: file.deleteType
                        }).then(
                            function () {
                                state = 'resolved';
                                $scope.clear(file);
                            },
                            function () {
                                state = 'rejected';
                            }
                        );
                    };
                } else if (!file.$cancel && !file._index) {
                    file.$cancel = function () {
                        $scope.clear(file);
                    };
                }
            }
        ])
	// Album controller
	.controller('albumController', function ($scope,$modal,$timeout,$rootScope,$window,$document) {
		$scope.isOpen = true;
		$rootScope._state.isFullscreen = false;
	    $scope.file_faicon = function(type,file) {
		    /* faicon description
				'fa-file-audio-o':slide.type=='picture', 
				'fa-file-audio-o':slide.type=='audio', 
				'fa-file-video-o':slide.type=='video', 
				'fa-file-text-o':slide.type=='document', 
				'fa-file-o':slide.type=='others'	    
			*/
			var faicon = ['fa'];
			var doc_exts = [
                'text\/plain',
                 'pdf',
                 'msword',
                 'vnd.openxmlformats-officedocument.wordprocessingml.document',
                 'vnd.oasis.opendocument.text',
                'vnd.ms-powerpoint',
                 'vnd.openxmlformats-officedocument.presentationml.presentation',
                'vnd.ms-excel',
                 'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                 'vnd.oasis.opendocument.spreadsheet',
                'vnd.oasis.opendocument.text-template',
                 'vnd.sun.xml.writer',
                'vnd.sun.xml.writer.template',
                 'vnd.oasis.opendocument.spreadsheet-template',
                 'vnd.sun.xml.calc',
                'vnd.sun.xml.calc.template',
                'vnd.oasis.opendocument.presentation',
                 'vnd.oasis.opendocument.presentation-template',
                'vnd.sun.xml.impress',
                'vnd.sun.xml.impress.template'];
			
			try {
				if (type.indexOf('/') === -1)
					throw type;
				if (file && file.name.indexOf('.ai') !== -1)
					if (/application\/postscript/i.test(type))
						throw 'image';
				if (/mp4/i.test(type))
					throw 'audio';
				var doc_pattern = new RegExp("("+doc_exts.join('|')+")");					
				if (doc_pattern.test(type))
					throw 'document';
				throw 'others';
			} catch (type) {
				switch (type) {
					case 'image' :
					case 'picture' :
						faicon.push('fa-file-image-o');
						break;
					case 'audio' :
						faicon.push('fa-file-audio-o');
						break;
					case 'video' :
						faicon.push('fa-file-video-o');
						break;
					case 'document' :
						faicon.push('fa-file-text-o');
						break;
					case 'folder' :
						faicon.push('fa-folder');
						break;
					default :
						faicon.push('fa-file-o');
						break;
				}
			}
		    return faicon.join(' ');
	    };
		$scope.forceStop = false;
		$scope.modalHeight = null;
		$scope.paginate = {
			current: -1,
			limit: 9,
			total: 1,
			range: [],
			count: 0,
			preload: []
		};
		$scope.spinner = null;
		$scope.resize = {
			modal: {h: $(document).height()-112},
			footer: {h: 112}
		}
		$scope.queue = {
			max: 3,
			current: [],
			range: [],
			type: 'visible',
			loaded: [],
			last: 0,
			visible: null,
			preload: $scope.paginate.preload,
			images: null
		}
		$scope.selected = null;

		var $modalBox = $('#albumModalBox');
		var $modal = $modalBox.modal({
			backdrop: false,
			keyboard: false,
			show: false
		});
		//console.log('album init...');
		
		$modalBox.on('show.bs.modal',function() {
			$scope.toggle_open();
		});
		//$modal.modal('show');
		
		var docWidth = $(document).width();
		var $albumWarp = $('#albumModalBox .slider-thumbwrap');

		$scope.get_idx = function(fileID) {
			return $scope._keys.indexOf(fileID);
		}
		$scope.get_file = function(fileID) {
			return $scope._files[$scope.get_idx(fileID)];
		}
		$scope.get_percentage_idx = function(percentage) {
			var idx = Math.ceil(percentage*$scope.paginate.count); 
			return (idx > 0 ? idx-1 : 0);
		}
		$scope.get_idx_percentage = function(idx) {
			return (idx/($scope.paginate.count-1));
		}
		$scope.get_idx_pageno = function(idx) {
			return Math.ceil((idx+1)/($scope.paginate.limit))-1;
		}
		
		$scope.reset_all = function() {
			//console.log('reset...');
			$scope._files = [];
			$scope.selected = null;
			$scope.selectedIdx = null;
			$scope.forceStop = false;
			$scope.paginate = {
				current: -1,
				limit: 9,
				total: 1,
				range: [],
				count: 0,
				preload: []
			};
			$scope.spinner = {
				action: null,
				percentage: null,
				markers: []
			}
			$scope._keys = null;
			//console.log('reset...',$scope.paginate.preload);
		};
		$scope.files_setup = function(params) {
			var files = [];
			for (var i=0; i<$rootScope._files.length; i++)
				if ($rootScope._files[i].type !== 'folder')
					files.push($rootScope._files[i]);
        	
    		var keys = [];
    		for (var i=0; i<files.length; i++) {
    			files[i].id = files[i]._id;
    			files[i].type = 'picture';
    			files[i].thumb_location = '/images/'+files[i].name;
				keys.push(files[i]._id);
    		}
    		$scope._keys = keys;
			$scope._files = files;
		}
		$scope.paginate_setup = function() {
			$scope.paginate.count = $scope._files.length;
			// Calculate thumbnails per page (paginate.limit)
			var screenWidth = window.innerWidth;
			var thumbWidth = 150;
			$scope.paginate.max =  Math.ceil(screenWidth/thumbWidth)-1;
			$scope.paginate.limit = 1;
			
			// Calculate total of pages (paginate.total)
			if ($scope.paginate.count > $scope.paginate.max)
				$scope.paginate.total = Math.floor($scope.paginate.count/$scope.paginate.limit);
		}
		$scope.page_resize = function(winSize) {
			$albumWarp = $('#albumModalBox .slider-thumbwrap');
			var win = angular.element($window);
	    	var $footer = $('#albumModalBox .modal-footer');
			if (!winSize) {
				var winSize = {
					width: win.width(),
					height: win.height()-$footer.height()
				}
			}
			if (winSize.height > (win.height()-$footer.height()))
				winSize.height = win.height()-$footer.height();
			console.log('page_resize:',winSize);
			
			
			//if (!$albumWarp.hasClass('initial'))
			//	$albumWarp.css('max-width',$scope.paginate.count*150);
			//$albumWarp.addClass('initial');
			//console.log('winsize_new?',winSize);
			$timeout(function() {
				// Setting content height
				$scope.resize.modal.w = winSize.width;
				$scope.resize.modal.h = winSize.height;
				//console.log('resize?',$scope.resize);
				
				$scope.albumwrap_update(true);
				if (!$scope.$$phase)
    				$scope.$digest();
				
		    	//console.log('resize?',$scope.resize);
		    	/*
				if (!$scope.$$phase)
					$scope.$digest();
        		$scope.$broadcast('slider:resize_content',{
	        		width: $(document).width(),
	        		height: ($(document).height()-$footer.height())
        		});
        		*/
			})
        	
        	/*
			$scope.modalHeight = $(document).height()-$footer.height();
			//$('#albumModalBox .main-container .thumb-inner').css('height',$scope.modalHeight);
			$scope.contentHeight = $('#albumModalBox .modal-body').height();
        	console.log('resize?',$scope.modalHeight,$scope.contentHeight,$footer.height());
        	*/
			
			//console.log('wrap_w:'+$albumWarp.css('width'),$albumWarp.width(),$albumWarp.hasClass('initial'));
		}
		$scope.slider_prepare = function(params) {
    		$scope.isOpen = true;
        	$scope.selected = params.file;
        	if ($scope.forceStop === true) return;
        	
			$scope.files_setup(params);
    		$scope.paginate_setup();
        	$timeout(function() {
	    		if ($scope.selected)
    				$scope.selected_item($scope.get_idx($scope.selected._id));
    		},700);
		}		
		
		$scope.toggle_open = function(params) {
        	$scope.isOpen = true;
			$document.on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange',function(event) {
				$rootScope._state.isFullscreen = !$rootScope._state.isFullscreen;
        		$scope.page_resize();
				//console.log('full?',$rootScope._state.isFullscreen,event);
			})

        	$timeout(function() {
    			//$('#albumToggle').trigger('click');
        	});
		}
        $scope.toggle_close = function(event) {
        	if (event && event.target) {
	        	if (event.target != event.delegateTarget)
	        		return;
        	}
			$scope.forceStop = true;
        	$scope.isOpen = false;
        	$modal.modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			
        	$timeout(function() {
        		$scope.reset_all();
        	})
        };
        $scope.paging_move = function(value,nothumb) {
			//var $albumWarp = $('#albumModalBox .slider-thumbwrap');
			var posLeft = value;
			var queue_params = {};
			if (typeof $albumWrap === 'undefined')
				var $albumWarp = $('#albumModalBox .slider-thumbwrap');
			
			if (value >= 0 && value <= 1) {
				posLeft = Math.ceil(value*($albumWarp.width()-docWidth))*-1;
				queue_params.percentage = value;
			}
			else if (posLeft > 0)
				posLeft = 0;
			queue_params.pos = posLeft;
				
			$albumWarp
				.css({
					left: posLeft
				});
			$scope.albumwarpSize = $albumWarp[0].getBoundingClientRect();
			
			if (nothumb === true) return false;
			
			//console.log('warp_s1:'+$albumWarp[0].offsetLeft,$albumWarp.position(),$albumWarp[0].getBoundingClientRect());
			$scope.forceStop = true;
			if ($scope.pagingThumbTimeout)
				$timeout.cancel($scope.pagingThumbTimeout);
			$scope.pagingThumbTimeout = $timeout(function() {
				$scope.$emit('slider:thumb_queue',queue_params);
			},2000);
        }
        $scope.paging_button = function(dir) {
        	var idx = $scope.get_idx($scope.selected.id);
        	if (dir == 'prev')
        		idx--;
        	else
        		idx++;
        	if (idx < 0)
        		idx = 0;
        	if (idx > $scope.paginate.count-1)
        		idx = $scope.paginate.count-1;
	        $scope.swap_selected(idx);
        }
        $scope.file_action = function(action,fileID) {
	        $rootScope.$emit('file:'+action,fileID);
        }
        
        $scope.selected_prev = function() {
        	var idx = $scope.selectedIdx;
        	$scope.$broadcast('slider:select',{
	        	idx: --idx,
	        	percentage: $scope.get_idx_percentage(idx),
	        	type: 'click'
        	});
        }
        $scope.selected_next = function() {
        	var idx = ($scope.selectedIdx);
        	$scope.$broadcast('slider:select',{
	        	idx: ++idx,
	        	percentage: $scope.get_idx_percentage(idx),
	        	type: 'click'
        	});
        }
		$scope.selected_item = function(idx) {
			//console.log('item_sel:',idx);
			if ($scope.selectedTimeout)
				$timeout.cancel($scope.selectedTimeout)
			$scope.selectedTimeout = $timeout(function() {
	        	$scope.$broadcast('slider:select',{
		        	idx: idx,
		        	percentage: $scope.get_idx_percentage(idx),
		        	type: 'click'
	        	});
			},100)
		};

		$scope.slider_highlight = function(idx) {
			$('.slider-thumbs .slide-item.highlight').removeClass('highlight');
			$('.slider-thumbs .idx-'+idx+' .slide-item').addClass('highlight');
		};
		$scope.$on('slider:highlight',function(event,idx) {
			$scope.slider_highlight(idx);
		})
		
		
		$scope.slider_image = function(item,callback) {
			var imgSrc = "/images/"+item.name;
			$timeout(function() {
				var $image = $('<img/>');
				$image
					.on('load',function() {
						if (callback) return callback();
						$(this).show();
						$(this).next().hide();
						$('#albumModalBox .media-item')
							.find('img')
							.attr('src',this.src).show()
							.next().hide();
					})
					.on('error',function(event) {
						if (!$rootScope._state.isBandwidthOver)
							myApi.fetch({
								url: '/account/dashboard',
								type: 'get',
							},function(response) {
								if (response.success) {
									var info = response.data;
									if (info.used_bandwidth_percentage && info.used_bandwidth_percentage >= 100) {
										$rootScope._state.isBandwidthOver = true;
										$rootScope.$broadcast('user:bandwidth_over');
									}
								}
							})
						$scope.infoCheck = true;
						if (callback) return callback();
						$(this).hide();
					})
					.attr('src',imgSrc.replace(/^https?:/i,''));
			})			
		}
		$scope.slider_document = function(item) {
			var $docCont = $('#albumModalBox .media-item > div');
			$docCont
				.removeClass('html-box')
				.find('iframe').remove();				
			$scope.selected.loaded = false;
		
			var document = $rootScope.get_file_downloadable(item);
			if (document === false) return;
			
			$iframe = $('<iframe src="'+document+'"></iframe>')
			$docCont.addClass('html-box').append($iframe);
			$scope.selected.loaded = true;
			if (!$scope.$$phase) $scope.$digest();
		}
		$scope.slider_select = function(idx) {
			if (!idx || idx < 0)
				idx = 0;
			if (idx > $scope.paginate.count-1)
				idx = $scope.paginate.count-1;
			if (!$scope._files[idx]) return;
			
			$scope.selectedIdx = idx;
			$scope.selected = $scope._files[idx];
			$('.slider-thumbs .slide-item.highlight').removeClass('highlight');
			
			switch ($scope.selected.type) {
				case 'picture' :
					$scope.slider_image($scope.selected)
					break;
				case 'document' :
					$scope.slider_document($scope.selected);
					break;
			}
		}
		$scope.$on('slider:select',function(event,params) {
			event.preventDefault();
			var lastIdx = $scope.selectedIdx;
			var idx = params.idx || null;
			
			if (!idx && params.percentage)
				idx = $scope.get_percentage_idx(params.percentage);
			if (!idx || idx < 0)
				idx = 0;	
				
			if (idx === lastIdx) return;
			
			var selected = $scope._files[idx];
			$scope.slider_select(idx);
			$scope.swap_selected(idx);
			
			$timeout(function() {
				$scope.$broadcast('slider:change',$.extend({},true,params,{
					item: $scope._files[idx],
					percentage: $scope.get_idx_percentage(idx)
				}));
			})
		})

		$scope.swap_selected_pos = function(idx) {
			if (typeof idx !== 'number') return;
			
			var posLeft = 0;
			var selectItem = $('#albumModalBox .slider-thumbwrap li.idx-'+idx);
			var itemLeft = selectItem.position().left;
			var docWidth = $(document).width();
			
			if (itemLeft < (docWidth/2))
				posLeft = 0;
			else {
				var itemCenter = (itemLeft+selectItem.width()/2);
				var moveCenter = docWidth/2-itemCenter;
				posLeft = moveCenter;
				
				var lastItem = $('#albumModalBox .slider-thumbwrap li:last-child');
				var lastLeft = (lastItem.position().left+lastItem.width());
				var diff = (lastLeft+posLeft);
				if (diff < docWidth)
					posLeft += (docWidth-diff);
			}
			return posLeft;
		}
		$scope.swap_selected = function(idx,nothumb) {
			$scope.spinner.action = 'selected';
			$scope.spinner.percentage = $scope.get_idx_percentage(idx);
			$scope.paging_move($scope.swap_selected_pos(idx),nothumb);
		}
		$scope.swap_percentage = function(params,nothumb) {
			$scope.spinner.action = 'percentage';
			$scope.spinner.percentage = params.percentage;
			
			$scope.paging_move(params.percentage,params.nothumb || nothumb);
		}
		$scope.$on('slider:swap_page',function(event,params) {
			$scope.swap_percentage(params);
		});
		
		$scope.albumwrap_spinner_chk = function() {
			var docWidth = $(document).width();
			var wrapChk = Math.ceil($albumWarp.width()/docWidth);
			if (wrapChk !== $scope.paginate.total) {
				$scope.paginate.total = wrapChk;
				if (!$scope.$$phase)
					$scope.$digest();
			}
		}
		$scope.albumwrap_pos_fix = function() {
			var percentage = $scope.spinner.percentage;
			if ($scope.spinner.action == 'selected')
				percentage = $scope.swap_selected_pos($scope.get_idx($scope.selected.id));
			if (typeof $albumwrapTimeout !== 'undefined')
				$timeout.cancel($albumwrapTimeout);
			$albumwrapTimeout = $timeout(function() {
				$scope.paging_move(percentage,true);
			},100);
		}
		$scope.albumwrap_update = function(isInit) {
			if (!$albumWarp || $albumWarp.length < 1) return;
		
			if (isInit) {
				var wrapWidth = 0;
				$('.slide-item',$albumWarp).each(function() {
					wrapWidth += $(this).width();
				})
			}
			$scope.albumwrap_spinner_chk();
		}
		
		$scope.thumb_images_clear = function() {
			for (var key in $scope.queue.images)
				$scope.queue.images[key].abort();
			$scope.queue.images = [];
		}
		$scope.thumb_queue_concurrent = function(idx,isAdd) {
			if (typeof idx === 'undefined') return;
			if (idx === -1) {
				$scope.queue.current = [];
				return;
			}
			
			if (!isAdd && $scope.queue.current.indexOf(idx) === -1) return;
			
			if (isAdd)
				$scope.queue.current.push(idx);
			else
				$scope.queue.current.splice($scope.queue.current.indexOf(idx),1);
		}
		$scope.thumb_queue_reset = function() {
			$scope.queue.range = null;
			$scope.queue.current = [];
			$scope.queue.preload = [];
			$scope.queue.last = 0;
			$scope.thumb_images_clear();
		}
		$scope.thumb_fix = function(idx) {
			var $thumbBox = $('.slider-thumbs .idx-'+idx);
			if ($thumbBox.hasClass('fixed')) return;
			
			var $thumbCont = $('.image-cont',$thumbBox);
			var $thumb = $('img',$thumbBox);
			if ($thumbCont.width()-$thumb.width() < 5) return;

			var imgWidth = $thumb.width();
			if (imgWidth < 1 || imgWidth >= 150) return;

			$thumbBox
				.addClass('fixed')
				.css('width',imgWidth);
			
			var wrapWidth = $albumWarp.width();
			wrapWidth -= (150-imgWidth);
			
			$albumWarp.css('width',wrapWidth);
			$scope.albumwrap_pos_fix();
		}
		$scope.thumb_load = function(idx,item,isRetry) {
			var thumbFile = item.thumb_location;
			if (!thumbFile) {
				$scope.thumb_queue_concurrent(idx,false);
				$scope.thumb_queue();
				return;
			}
				
			var $thumbBox = $('.slider-thumbs .idx-'+idx);
			var $thumb = $thumbBox.find('img');
			var xhrIdx = null;

			var img_loaded = function() {
				$scope.queue.preload.push(idx);
				$thumbBox.find('.slide-item').addClass('loaded');
				$scope.thumb_fix(idx);
				$thumb.show();
			}

			var counter;
			$thumb[0]
				.addEventListener('load', function() {
					
					$scope.queue.preload.push(idx);
					img_loaded(idx);
					
					//var now = new Date();
					//console.log('thumb_loaded...'+idx+',',$scope.queue.current);
					//console.log('thumb_count...'+idx,now.getMilliseconds()-counter.getMilliseconds(),$scope.queue.current);
					
					//$timeout(function() {
						$scope.thumb_queue_concurrent(idx,false);
						$scope.thumb_queue();
					//},2000)
				})
				
			if ($scope.queue.preload.indexOf(idx) !== -1) {
				$thumb.attr('src',thumbFile);
				$scope.thumb_queue();
				return;
			}
			
			//$scope.thumb_queue_concurrent(idx,true);
				
			/*
			if ($scope.queue.preload.indexOf(idx) !== -1) {
				$scope.queue.preload.push(idx);
				img_loaded(idx);
				return;
			}
			*/
			
			//if ($scope.queue.type !== '') {
			
			var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
			if (!xhr) {
				xhr.open('GET', thumbFile,true);
				xhr.responseType = "blob";
				xhr.onabort = function(event) {
					$thumbBox.find('.slide-item').removeClass('loaded');
					$thumb.hide();
					return;
				};
				xhr.onload = function(state) {
					$thumb.attr('src',window.URL.createObjectURL(xhr.response)).show();
					$scope.queue.images.splice(xhrIdx,1);
				};
				xhr.send();
				
				if (!$scope.queue.images)
					$scope.queue.images = [];
				$scope.queue.images.push(xhr);
				xhrIdx = $scope.queue.images.length-1;
			} else {
				$scope.queue.images = null;
				var $image = $('<img>');
				$image
				.bind('load', function() {
					$thumb.attr('src',thumbFile.replace(/^https?:/i,'')).show();
				})
				.bind('error', function() {
					img_loaded(idx);
					$thumbBox.find('.slide-item').removeClass('loaded');
					$thumb.hide();
				})
				.attr('src',thumbFile.replace(/^https?:/i,''));
			}
		}
		$scope.thumb_queue = function(range) {
			 var range = range || $scope.queue.range;
			 var idx, item;
			 
			try {
				if (!$scope.queue.range) return false;
			
				if ($scope.forceStop === true)
					throw "force_stop";
				
				if ($scope.queue.range.length < 1) {
					if ($scope.queue.preload.length < $scope.queue.last && $scope.queue.type !== 'preload_big')
						throw 'waiting';
						
					if ($scope.queue.preload.length < $scope.paginate.max)
						throw 'ended';
						
					if ($scope.queue.preload.length == $scope.paginate.count)
						throw 'ended';
						
					if ($scope.spinner.action=='selected' && $scope.queue.loaded.indexOf('preload_big') === -1)
						throw 'preload_big';
					if ($scope.queue.loaded.indexOf('tail') === -1)
						throw 'ended_tail';
					if ($scope.queue.loaded.indexOf('head') === -1)
						throw 'ended_head';
				}
				
				idx = $scope.queue.range[0];
				if (typeof idx !== 'number')
					throw 'ended';
				item = $scope._files[idx];
					
				if ($scope.queue.type == 'preload_big') {
					//console.log('load_big:',item.id,item);
					$scope.slider_image(item,function() {
						
					});
					throw 'next';
				}
					
				if ($scope.queue.preload.indexOf(idx) !== -1)
					throw 'next';
					
				var $thumbBox = $('.slider-thumbs .idx-'+idx), thumbPos = $thumbBox[0].getBoundingClientRect();
				if ($scope.queue.type == 'visible') {
					var limit = ($scope.paginate.limit === 1 ? $scope.paginate.max : $scope.paginate.limit);
					var extraItem = Math.ceil(limit*0.3);
					if (thumbPos.left <= -150*extraItem || thumbPos.left > (docWidth+150*extraItem)) {
						$scope.queue.last--;
						throw 'over_next';
					}
				}
				
				if (!item)
					throw 'noitem_next';
				
				if (!item.thumbnail_location && item.type != 'picture') {
					$scope.queue.preload.push(idx);
					$thumbBox.find('.slide-item').removeClass('loaded');
					throw 'nothumb_next';
				}
				
				if ($thumbBox.find('.slide-item').hasClass('loaded')) {
					$scope.queue.preload.push(idx);
					throw 'loaded_next';
				}

				if ($scope.queue.max && $scope.queue.current.length >= $scope.queue.max)
					throw 'concurrent_limit';
				
				$scope.thumb_queue_concurrent(idx,true);
				$scope.thumb_load(idx,item);
				if ($scope.queue.range.length >= 1)
					throw 'next';
			} catch (_state) {
				//console.log('state...'+$scope.queue.range[0],_state);
				switch (_state) {
					case 'xhr_limit' :
						//console.log('xhr_no:',$scope.queue.images.length,$scope.queue.images);
						break;
					case 'concurrent_limit' :
						//console.log('concurrent_no:',$scope.queue.current.length);
						break;
					case 'waiting' :
						break;
					case 'next' :
					case 'over_next' :
					case 'loaded_next' :
					case 'noitem_next' :
					case 'nothumb_next':
					case 'loaded_next' :
						if ($scope.queue.range.length > 0)
							$scope.queue.range.splice(0,1);
						$scope.thumb_queue();
						break;
					case 'force_stop' :
						$scope.thumb_images_clear();
						//$scope.thumb_queue_concurrent(-1);
					case 'ended' :
						//$scope.queue.range = [];
						//$scope.albumwrap_pos_fix();
							//var now = new Date();
							//console.log('end_time:',now.getTime(),now.getTime()-$scope.counter.getTime());
						break;
					case 'preload_big' :
						$scope.queue.range = $scope.thumb_range($scope.selectedIdx,'preload_big');
						//console.log('run_big:',$scope.queue.range);
						$scope.queue.current = [];
						$scope.forceStop = false;
						$scope.thumb_queue();
						break;
					case 'ended_tail' :
						$scope.queue.range = $scope.thumb_range($scope.queue.preload.length,'tail');
						$scope.queue.current = [];
						$scope.forceStop = false;
						$scope.thumb_queue();
						break;
					case 'ended_head' :
						$scope.queue.range = $scope.thumb_range(0,'head');
						$scope.queue.current = [];
						$scope.forceStop = false;
						$scope.thumb_queue();
						break;
				}
			}
		}
		$scope.thumb_range = function(params,type) {
			var limit = ($scope.paginate.limit === 1 ? $scope.paginate.max : $scope.paginate.limit);
			var countStart = 0, countStop = limit*2, centerIdx = 0;
			var range = [], type = type || 'visible', reverse = false, idx = null;
			//console.log('range_p:',params);
			
			switch (type) {
				case 'head' :
					$scope.queue.max = 3;
					countStart = 0;
					countStop = $scope.queue.visible || $scope.queue.preload[0];
					reverse = true;
					break;
				case 'tail' :
					$scope.queue.max = 3;
					countStart = ($scope.queue.visible+$scope.paginate.max);
					countStop = $scope._files.length;
					break;
				case 'preload_big' :
					$scope.queue.max = null;
					centerIdx = $scope.get_idx($scope.selected.id);
					countStart = (centerIdx+1);
					countStop = (countStart+4);
					//console.log('range_big:',centerIdx,countStart,countStop);
					break;
				default :
					$scope.queue.max = null;
					$scope.queue.loaded = [];
					
					if ($scope.spinner.action == 'selected') {
						var selectedIDX = $scope.get_idx($scope.selected.id);
						if (selectedIDX)
							range.push(selectedIDX);
						idx = selectedIDX;
					} else
						idx = $scope.get_percentage_idx(params.percentage);
					
					//var idx = params.idx || selectedIDX || null,  = selectedIDX || 0;
					if (!idx && params.idx)
						idx = params.idx;
					if (!idx && params.pos)
						idx = $scope.get_percentage_idx((params.pos*-1)/$albumWarp.width());
					
					centerIdx = idx;
					countStart = (centerIdx-Math.ceil(limit*5));
					countStop = (centerIdx+Math.ceil(limit*5));
					if (countStart >= $scope._files.length-limit)
						countStart = $scope._files.length-limit-1;
					$scope.queue.visible = countStart;
					//console.log('visible?'+centerIdx,limit,countStart,countStop,params);
					break;
			}
			$scope.queue.type = type;
			$scope.queue.loaded.push(type);
			
			if (countStart < 0)
				countStart = 0;
			if (countStop < countStart)
				countStop = (countStart+1);
			
			if (reverse) {
				for (var i=countStop; i>=countStart && i>=0; i--) {
					if (range.indexOf(i)===-1 && $scope.queue.preload.indexOf(i) === -1)
						range.push(i);
					else
						$scope.thumb_fix(i);
				}
			} else {
				for (var i=countStart; i<=countStop && i<$scope._files.length; i++) {
					if ($scope.queue.type!=='preload_big' && $scope.queue.preload.indexOf(i) !== -1)
						continue;
					if (range.indexOf(i) !==-1)
						continue;
					range.push(i);
					//else
					//	$scope.thumb_fix(i);
				}
				/*
				if ($scope.queue.type == 'visible' && $scope.spinner.action === 'selected') {
					if (!centerIdx)
						centerIdx = $scope.get_idx($scope.selected.id);
					for (var i=(centerIdx+1); i < (centerIdx+5); i++)
						range.push(centerIdx);
				}
				*/
			}
			//console.log('range...',$scope.queue.type,centerIdx,params.percentage,countStart,countStop,range);
			
			$scope.queue.last += range.length;
			return range;
		}
		$scope.$on('slider:thumb_queue', function(event,params) {
			if (event.defaultPrevented)
				return false;
			event.preventDefault();
			
			//$scope.counter = new Date();
			//console.log('count_start:',$scope.counter.getTime());
			if ($scope.queue.preload.length === $scope.paginate.count)
				return;
			
		
			//console.log('preload?',$scope.queue.preload.length,$scope._files.length);
			/*
			if ($scope.thumbLoadTimeout)
				$timeout.cancel($scope.thumbLoadTimeout);
			$scope.thumbLoadTimeout = $timeout(function() {
			*/
				$scope.forceStop = true;
				$scope.thumb_images_clear();
				$scope.thumb_queue_reset();
				if ($scope.queue.max)
					$scope.queue.current = [];
			
				var range = $scope.thumb_range(params);
				$scope.queue.range = range;
				//if (!$scope.$$pahse)
				//	$scope.$digest();
				//console.log('queue_run:',$scope.queue.range.length,$scope._files.length,$scope.queue.range);
				
				$scope.forceStop = true;
				if ($scope.queueTimeout)
					$timeout.cancel($scope.queueTimeout);
				$scope.queueTimeout = $timeout(function() {
					$scope.forceStop = false;
					$scope.thumb_queue();
				//$scope.thumb_images_clear();
				},100);
			//	},300)
		});
		
		$scope.$on('slider:resize', function(event,winSize) {
			//$scope.winSize = winSize;
			console.log('slider:main_resize:',winSize);
			$scope.page_resize(winSize);
		})		
        $rootScope.$on('files:open',function(event,params) {
        	//$rootScope._state.filelist.action = 'album';
	        //$scope.reset_all();
    		$scope.slider_prepare(params);
			$('#albumModalBox').modal('show');
	        
			//$scope.toggle_open(params);
        });
        $scope.reset_all();
                
        /*
		hotkeys.add({
			combo: ['left','up'],
			callback: function() {
				$scope.selected_prev();
			}
		});
		hotkeys.add({
			combo: ['right','down'],
			callback: function() {
				$scope.selected_next();
			}
		});
		hotkeys.add({
			combo: ['escape'],
			callback: function(event) {
				//console.log('event?',event);
				if ($rootScope._state.isFullscreen === true)
					return false;
				$scope.toggle_close();
			}
		});
		*/
	})
	.directive('aalbumResize',function($window) {
		return function($scope,elem) {
			var win = angular.element($window);
			$scope.window_resize = function() {
		    	var $footer = $('#albumModalBox .modal-footer');
    			return {
	    			width: win.width(),
	    			height: win.height()-$footer.height()
    			}
			}
        	console.log('win_resize_init?',$scope.window_resize());
        	/*
			win.bind('resize', function() {
				if ($scope.$parent && !$scope.$parent.$$phase)
    				$scope.$parent.$digest();
			})
			*/
	        $scope.$watch($scope.window_resize, function(winSize) {
	        	//$scope.$parent.winSize = winSize;
	        	//$scope.winSize = winSize;
	        	console.log('win_resize?',winSize);
	        	$scope.$parent.$broadcast('slider:resize', winSize);
	        	win.unbind('resize');
	        },true);
		}
	})
	.directive('slideToolbar', function() {
		return {
			restrict: 'A',
			scope: {
				slides2: '=',
				slideIndex2: '='
			}
		}
	})
	.directive('slideItem', function() {
		return {
			restrict: 'C',
			link: function($scope,elem) {
				var width = 150;
				if ($scope.slide.dimension) {
					var size = $scope.slide.dimension.split('x');
					var sizeH = parseInt(size[1]);
					var scaleH = 100/sizeH;
					width = Math.floor(parseInt(size[0])*scaleH);
				}
				elem.find('img').css('max-width',width);
				elem.parent().addClass('fixed').css('width',width);
				if ($scope.$index === $scope.$parent.sliders.length-1) {
					var wrapWidth = 0;
					$('.slide-item').each(function() {
						wrapWidth += $(this).width();
					})
					if (wrapWidth > 0)
						$('#albumModalBox .slider-thumbwrap').css('width',wrapWidth);
				}
			}
		}
		
	})
	.directive('spinnerControl', function($timeout,$rootScope) {
		return {
			restrict: 'C',
			link: function($scope,elem) {
				$scope.spinner = $scope.$parent.spinner;
				
				var $btnControl = elem.find('.btn-default');
				var $modalBox = $('#albumModalBox');
				var $progess = elem.find('.progress');
				var docWidth = $(document).width();
				var lastX = null, parentSize = null, timeout=null;
				
				var setSelectPrecent = function(posX) {
		    		var fullWidth = $progess.width();
					var progressSize = $progess[0].getBoundingClientRect();
					var padding = Math.floor((docWidth-progressSize.width)/2);
					var $btnControl = elem.find('.btn'),btnSize=$btnControl[0].getBoundingClientRect();
		    		
					var percentage = (posX/(fullWidth-padding*2-btnSize.width/2));
					$scope.spinner.percentage = percentage>1 ? 1 : percentage;
					return $scope.spinner.percentage;
				}
				
				var setControlPos = function(pos) {
					var modalWidth = $modalBox.width();
					var progressSize = $progess[0].getBoundingClientRect();
					var padding = Math.floor((modalWidth-progressSize.width)/2);
					var $btnControl = elem.find('.btn'),btnSize=$btnControl[0].getBoundingClientRect();
				
					var moveX = (pos);
					if (moveX <= btnSize.width/2)
						moveX = btnSize.width/2;
					if (moveX > progressSize.width-btnSize.width/2)
						moveX = progressSize.width-btnSize.width/2;
					
		    		$btnControl.css({
		    			left: moveX-padding
		    		});
				}
				var setControlPercentage = function(percentage) {
					var progressSize = $progess[0].getBoundingClientRect();
					setControlPos(percentage*progressSize.width);
				}
				
				var mouseMove = function(event) {
		    		setControlPos(event.pageX);

					var movePerc = setSelectPrecent(event.pageX);
					
					$scope.$emit('slider:swap_page',{
						percentage: movePerc,
						loading: true,
						timeout: 300,
						type: 'mousemove'
					});
					
		    		return false;
				}
				var mouseUp = function(event) {
		    		event.preventDefault();
					
					$modalBox.off('mousemove',mouseMove);
					$modalBox.off('mouseup',mouseUp);
		    		return false;
				}
				var mouseDown = function(event) {
		    		event.preventDefault();
		    		event.stopPropagation();
		    		
					if (!parentSize)
		    			parentSize = $progess[0].getBoundingClientRect();
					
					setControlPos(event.pageX);
					
					
					var movePerc = setSelectPrecent(event.pageX);
					$scope.$emit('slider:swap_page',{
						percentage: movePerc,
						loading: true,
						timeout: 300,
						type: 'mousemove'
					});
					
					$modalBox.on('mouseup',mouseUp);
		    		$modalBox.on('mousemove',mouseMove);
					$modalBox.on('mouseleave',mouseUp);
					return false;
				};
			
				$btnControl.on('mousedown',mouseDown);
				$progess.on('mousedown',mouseDown);
				
				$timeout(function() {
					if (!parentSize)
		    			parentSize = $progess[0].getBoundingClientRect();
				},300)
				
				$scope.$parent.$on('slider:change',function(event,params) {
					if (params.type && params.type == 'mousemove')
						return;
					$scope.spinner = {
						percentage: params.percentage,
					}
					setControlPercentage(params.percentage);
				});
			}
		}
	})
        

}());
