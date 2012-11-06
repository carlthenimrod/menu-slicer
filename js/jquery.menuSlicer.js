;(function($, win){

	//create defaults
	var defaults = {

		//attributes
		subMenuAnimation : 'fade',
		subMenuAnimationSpeed : 200,
		subMenuCloseSpeed : 200,

		//classes
		menuClass : 'ms-menu',
		moreMenuClass : 'ms-more-menu',
		moreLinkClass : 'ms-more-link',
		subMenuClass : 'ms-sub-menu',

		//options
		minWidth : false,
		maxWidth : false,
		sliceMethod : 'height',
		whiteList : false
	};

	function MenuSlicer(element, options){

		//attributes
		this.active = false;
		this.animating = false;
		this.subMenuActive = false;
		this.subMenuTimer = false;

		//store menu items
		this.menuItems = $(element).find('li');

		//cache element
		this.element = element;
		
		//create config
		this.config = $.extend({}, defaults, options);

		//initialize menu
		this.init();
	};

	MenuSlicer.prototype.init = function(){

		//cache this
		var that = this,
			$this = $(that.element);

		//add menuClass to element class
		$this.addClass(that.config.menuClass);

		//create menu
		that.buildMenu();

		//EVENTS
		//on window resize
		$(win).on('resize', function(){ that.buildMenu() });

		//on more menu click
		$('.' + that.config.menuClass).on('click', '.' + that.config.moreLinkClass, function(e){ that.subMenuDisplay(e) });

		//on more menu mouseover
		$('.' + that.config.menuClass).on('mouseenter', '.' + that.config.moreMenuClass, function(e){ that.subMenuMouseOver() });

		//on more menu mouseleave
		$('.' + that.config.menuClass).on('mouseleave', '.' + that.config.moreMenuClass, function(e){ that.subMenuMouseLeave() });		
	};

	MenuSlicer.prototype.buildMenu = function(){

		var that = this;

		//set width of container
		that.setWidth();

		//set height of element
		that.setHeight();

		//slice method width
		if(that.config.sliceMethod === 'width'){

			//if containerWidth is greater than maxWidth, resetMenu
			if((that.config.maxWidth) && (that.config.containerWidth > that.config.maxWidth)){

				//if menu is active, reset
				if(that.active){
					
					that.resetMenu();
				}
			}
			//else if containerWidth is less than minWidth, resetMenu
			else if((that.config.minWidth) && (that.config.containerWidth < that.config.minWidth)){

				//if menu is active, reset
				if(that.active){

					that.resetMenu();
				}
			}
			//else, createMenu
			else{

				that.createMenu();
			}
		}
		//slice method height
		else{

			that.createMenu();
		}

		//if open, close subMenu
		if(that.subMenuActive){

			that.subMenuClose();
		}
	};

	MenuSlicer.prototype.createMenu = function(){

		var that = this,
			$this = $(that.element),
			menuItems = that.menuItems,
			subMenuItems = [],
			totalWidth = 0,
			li, a, i, l;

		//empty element
		$this.html('');

		//create list item for more results
		li = $('<li>', {
			"class" : that.config.moreMenuClass
		});

		//create anchor
		a = $('<a/>', {
			"href" : "#",
			"alt" : "More...",
			"title" : "More...",
			"class" : that.config.moreLinkClass,
			"html" : "More..."
		});

		//append anchor to more list item
		li.append(a);

		//slice method width
		if(that.config.sliceMethod === 'width'){

			//append to element
			$this.append(li);

			//add to totalWidth
			totalWidth = totalWidth + li.outerWidth();

			//remove from DOM
			li.remove();

			//if whitelist exists, sort menu by white list
			if(that.config.whiteList){

				subMenuItems = that.sortWhiteList(menuItems, li, totalWidth);
			}
			//else sort by width only
			else{

				subMenuItems = that.sortWidth(menuItems, totalWidth);
			}

			//if sub menu items exist
			if(subMenuItems.length > 0){

				//create SubMenu, pass more li with subMenuItems
				that.createSubMenu(subMenuItems, li);
			}

			//menu is now active
			that.active = true;

			//append unordered list to element
			$this.append(li);			
		}
		//slice method height
		else{

			var currentHeight,
				divClear = $('<div/>', {
				style : "clear: both;"
			});

			for(i = 0, l = menuItems.length; i < l; ++i){

				//append menu item
				$this.append(menuItems[i]);

				//add div clear
				$this.append(divClear);

				//set element current height
				currentHeight = $this.height();

				//remove div clear
				divClear.remove();

				//if current height exceeds element height
				if(currentHeight > that.elementHeight){

					//if whitelist exists, sort menu by white list
					if(that.config.whiteList){

						subMenuItems = that.sortWhiteList(menuItems, li);
					}
					//else sort by width only
					else{

						subMenuItems = that.sortList(menuItems, li);
					}

					//if sub menu items exist
					if(subMenuItems.length > 0){

						//create SubMenu, pass more li with subMenuItems
						that.createSubMenu(subMenuItems, li);
					}

					//menu is now active
					that.active = true;

					//append unordered list to element
					$this.append(li);
				}
			}
		}	
	};

	MenuSlicer.prototype.resetMenu = function(){

		var that = this,
			$this = $(that.element),
			menuItems = that.menuItems,
			i, l;

		//empty element
		$this.html('');			

		//for every menu item, add normally
		for(i = 0, l = menuItems.length; i < l; ++i){

			$this.append(menuItems[i]);
		}

		//menu no longer active
		that.active = false;
	};

	MenuSlicer.prototype.subMenuDisplay = function(e){

		var that = this;

		//if menu is not open, open menu
		if(!that.subMenuActive){

			that.subMenuOpen();
		}
		//else close menu
		else{

			that.subMenuClose();
		}

		//prevent default
		e.preventDefault();
	};

	MenuSlicer.prototype.subMenuShow = function(){

		var that = this;

		//fade
		if(that.config.subMenuAnimation === 'fade'){

			//stop animation
			$('.' + that.config.subMenuClass).stop();

			//adjust css back to normal
			$('.' + that.config.subMenuClass).css({
				'display' : 'block',
				'opacity' : 1
			});

			//subMenu is opened
			that.subMenuActive = true;

			//no longer animating
			that.animating = false;
		}
		//slide
		else if(that.config.subMenuAnimation === 'slide'){

			//stop animation
			$('.' + that.config.subMenuClass).stop();

			//adjust css back to normal
			$('.' + that.config.subMenuClass).css({
				'height' : '',
				'margin-top' : '',
				'margin-bottom' : '',
				'overflow' : '',
				'padding-top' : '',
				'padding-bottom' : ''
			});

			//subMenu is opened
			that.subMenuActive = true;

			//no longer animating
			that.animating = false;
		}
	};

	MenuSlicer.prototype.subMenuOpen = function(){

		var that = this,
			dfd = $.Deferred();

		//if not animating already
		if(!that.animating){

			//now animating
			that.animating = true;

			//fade
			if(that.config.subMenuAnimation === 'fade'){

				//set css
				$('.' + that.config.subMenuClass).css({
					'display' : 'block',
					'opacity' : '0'
				})
				//perform animation
				.animate({
					'opacity' : 1
				}, that.config.subMenuAnimationSpeed, function(){ dfd.resolve() });
			}
			//slide
			else if(that.config.subMenuAnimation === 'slide'){

				//slide toggle
				$('.' + that.config.subMenuClass).slideToggle(that.config.subMenuAnimationSpeed, function(){

					//resolve deferred
					dfd.resolve();
				});
			}
			//show/hide							
			else{

				//show menu
				$('.' + that.config.subMenuClass).css('display' , 'block');

				//resolve deferred
				dfd.resolve();
			}

			//when menu is done animating, set subMenuActive to true
			dfd.done(function(){

				//subMenu is open
				that.subMenuActive = true;

				//no longer animating
				that.animating = false;
			});
		}
	};

	MenuSlicer.prototype.subMenuClose = function(){

		var that = this,
			dfd = $.Deferred();

		//if not animating already
		if(!that.animating){

			//now animating
			that.animating = true;			

			//fade
			if(that.config.subMenuAnimation === 'fade'){

				//perform animation
				$('.' + that.config.subMenuClass).animate({
					'opacity' : 0
				}, that.config.subMenuAnimationSpeed, function(){ 

					//hide element
					$(this).css('display', 'none');

					//resolve deferred
					dfd.resolve();
				});
			}
			//slide
			else if(that.config.subMenuAnimation === 'slide'){

				//slide toggle
				$('.' + that.config.subMenuClass).slideToggle(that.config.subMenuAnimationSpeed, function(){

					//resolve deferred
					dfd.resolve();
				});
			}
			//show/hide				
			else{

				//hide menu
				$('.' + that.config.subMenuClass).css('display' , 'none');

				//resolve deferred
				dfd.resolve();				
			}		

			//when menu is done animating, set subMenuActive to false
			dfd.done(function(){

				//subMenu is closed
				that.subMenuActive = false;

				//no longer animating
				that.animating = false;				
			});
		}
	};

	MenuSlicer.prototype.subMenuMouseOver = function(){

		var that = this;

		//if timer exists, clear it
		if(that.subMenuTimer){

			clearTimeout(that.subMenuTimer)
		}	

		//if menu is not open, open menu
		if(!that.subMenuActive){

			that.subMenuOpen();
		}
		//if menu is open, stop animation and show
		else{

			//show menu
			that.subMenuShow();
		}	
	};

	MenuSlicer.prototype.subMenuMouseLeave = function(){

		var that = this;

		//start timer on mouse leave
		that.subMenuTimer = setTimeout(function(){ that.subMenuClose() }, that.config.subMenuCloseSpeed);
	};

	MenuSlicer.prototype.setWidth = function(){

		//set container width
		this.config.containerWidth = $(this.element).width();
	};

	MenuSlicer.prototype.setHeight = function(){

		var that = this,
			$this = $(that.element),
			divClear = $('<div/>', {
				style : "clear: both;"
			});

		//empty element
		$this.html('');

		//append first element
		$this.append(that.menuItems.first());

		//append clear div
		$this.append(divClear);

		//set element height
		that.elementHeight = $this.height();

		//remove clear div
		divClear.remove();

		//reset menu after getting height
		that.resetMenu();
	};

	MenuSlicer.prototype.sortList = function(menuItems, moreMenu){

		var that = this,
			$this = $(that.element),
			subMenuItems = [],
			currentHeight,
			divClear = $('<div/>', {
				style : "clear: both;"
			}),
			i, l;

		//empty element
		$this.html('');

		//for each item
		for(i = 0, l = menuItems.length; i < l; ++i){

			//append menu option
			$this.append(menuItems[i]);

			//append more menu
			$this.append(moreMenu);

			//append div clear
			$this.append(divClear);

			//set current height
			currentHeight = $this.height();

			//remove div
			divClear.remove();

			//remove more menu
			moreMenu.remove();

			//if current height exceeds element height
			if(currentHeight > that.elementHeight){

				//remove item
				$(menuItems[i]).remove();

				//add to subMenuItems array
				subMenuItems.push(menuItems[i]);					
			}
		}

		//return subMenuItems
		return subMenuItems;
	};

	MenuSlicer.prototype.sortWhiteList = function(menuItems, moreMenu, totalWidth){

		var that = this,
			$this = $(that.element),
			whiteList = that.config.whiteList,
			subMenuItems = [],
			i, l, x, match;

		//reset html
		$this.html('');

		//for each item
		for(i = 0, l = menuItems.length; i < l; ++i){

			//match false by default, reset for each iteration
			match = false;

			//for each item in whiteList, check to see if matches
			for(x in whiteList){

				//if match is found, set to true
				if(whiteList[x] === menuItems[i].id){

					match = true;
				}
			}

			if(!match){

				//add to subMenuItems array
				subMenuItems.push(menuItems[i]);				

				//if no match, skip to next iteration
				continue;
			}

			//append list item to element
			$this.append(menuItems[i]);

			//slice method width
			if(that.config.sliceMethod === "width"){

				//add to totalWidth
				totalWidth = totalWidth + $(menuItems[i]).outerWidth(true);

				//if totalWidth is greater than containerWidth, remove element
				if(totalWidth >= that.config.containerWidth){

					//remove item
					$(menuItems[i]).remove();

					//remove from totalWidth
					totalWidth = totalWidth - $(menuItems[i]).outerWidth(true);

					//add to subMenuItems array
					subMenuItems.push(menuItems[i]);		
				}
			}
			else{

				//set current height
				var currentHeight,
					divClear = $('<div/>', {
						style : "clear: both;"
					});

				//append more menu
				$this.append(moreMenu);

				//append div clear
				$this.append(divClear);

				//set current height
				currentHeight = $this.height();

				//remove div
				divClear.remove();

				//remove more menu
				moreMenu.remove();

				//if current height exceeds element height
				if(currentHeight > that.elementHeight){

					//remove item
					$(menuItems[i]).remove();

					//add to subMenuItems array
					subMenuItems.push(menuItems[i]);					
				}
			}
		}

		//return subMenuItems
		return subMenuItems;
	};

	MenuSlicer.prototype.sortWidth = function(menuItems, totalWidth){

		var that = this,
			$this = $(that.element),
			subMenuItems = [],
			i, l;

		//for each item
		for(i = 0, l = menuItems.length; i < l; ++i){

			//append list item to element
			$this.append(menuItems[i]);

			//add to totalWidth
			totalWidth = totalWidth + $(menuItems[i]).outerWidth(true);

			//if totalWidth is greater than containerWidth, remove element
			if(totalWidth >= this.config.containerWidth){

				//remove item
				$(menuItems[i]).remove();

				//remove from totalWidth
				totalWidth = totalWidth - $(menuItems[i]).outerWidth(true);

				//add to subMenuItems array
				subMenuItems.push(menuItems[i]);
			}
		}

		//return subMenuItems
		return subMenuItems;
	};	

	MenuSlicer.prototype.createSubMenu = function(subMenuItems, li){
		
		var that = this,
			$this = $(that.element),
			ul, i, l;

		//create list to hold subMenuItems
		ul = $('<ul>', {
			"class" : that.config.subMenuClass
		});

		//for each subMenuItem, add to ul
		for(i = 0, l = subMenuItems.length; i < l; ++i){

			//append to list
			ul.append(subMenuItems[i]);
		}

		//append unordered list to more list item
		li.append(ul);
	};

	$.fn.menuSlicer = function(options){

		//for each element in collection
		return this.each(function(){

			//create new MenuSlicer
			new MenuSlicer(this, options);
		});
	};

})(jQuery, window);