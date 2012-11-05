;(function($, win){

	//create defaults
	var defaults = {

		//classes
		menuClass : 'ms-menu',
		moreMenuClass : 'ms-more-menu',
		moreLinkClass : 'ms-more-link',
		subMenuClass : 'ms-sub-menu',

		//options
		minWidth : false,
		maxWidth : false,
		whiteList : false
	};

	function MenuSlicer(element, options){

		//attributes
		this.active = false;
		this.subMenuActive = false;

		//store menu items
		this.menuItems = $(element).find('li');
		
		//create config
		this.config = $.extend({}, defaults, options);

		//cache element
		this.element = element;

		//initialize menu
		this.init();
	};

	MenuSlicer.prototype.init = function(){

		//cache this
		var that = this,
			$this = $(that.element);

		//add default class to element
		$this.addClass(that.config.menuClass);

		//create menu
		that.buildMenu();

		//events
		$(win).on('resize', function(){ that.buildMenu() });

		$('.' + that.config.menuClass).on('click', '.' + that.config.moreMenuClass, function(e){ that.subMenuDisplay(e) });
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

	MenuSlicer.prototype.subMenuOpen = function(){

		var that = this;

		//show menu
		$('.' + that.config.subMenuClass).css('display' , 'block');

		//subMenu is open
		that.subMenuActive = true;
	};

	MenuSlicer.prototype.subMenuClose = function(){

		var that = this;		
		
		//hide menu
		$('.' + that.config.subMenuClass).css('display' , 'none');

		//subMenu is open
		that.subMenuActive = false;		
	};

	MenuSlicer.prototype.buildMenu = function(){

		var that = this;

		//set width of container
		that.setWidth();

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
			li, a;

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

		//append to element
		$this.append(li);

		//add to totalWidth
		totalWidth = totalWidth + li.outerWidth();

		//remove from DOM
		li.remove();

		//if whitelist exists, sort menu by white list
		if(that.config.whiteList){

			subMenuItems = that.sortWhiteList(menuItems, totalWidth);
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

	MenuSlicer.prototype.setWidth = function(){

		//set container width
		this.config.containerWidth = $(this.element).width();
	};

	MenuSlicer.prototype.sortWhiteList = function(menuItems, totalWidth){

		var that = this,
			$this = $(that.element),
			whiteList = that.config.whiteList,
			subMenuItems = [],
			i, l, x, match;

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

		//append unordered list to element
		$this.append(li);
	};

	$.fn.menuSlicer = function(options){

		//for each element in collection
		return this.each(function(){

			//create new MenuSlicer
			new MenuSlicer(this, options);
		});
	};

})(jQuery, window);