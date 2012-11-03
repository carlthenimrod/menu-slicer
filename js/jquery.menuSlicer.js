;(function($, win){

	//create defaults
	var defaults = {

		maxItems : false,
		maxWidth : false,
		whiteList : false,
	};

	function MenuSlicer(element, options){

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
		var that = this;

		//create menu
		that.createMenu();

		//events
		$(win).on('resize', function(){ that.createMenu() });
	};

	MenuSlicer.prototype.setWidth = function(){

		//if max width is set, otherwise, set it to width of container
		if(!this.config.maxWidth){

			//set container width
			this.config.containerWidth = $(this.element).width();
		};
	};

	MenuSlicer.prototype.createMenu = function(){

		var that = this,
			$this = $(that.element),
			menuItems = that.menuItems,
			subMenuItems = [],
			totalWidth = 0,
			li, a;

		//set width of container
		that.setWidth();

		//empty element
		$this.html('');

		//create list item for more results
		li = $('<li>', {
			"class" : "ms-more-menu"
		});

		//create anchor
		a = $('<a/>', {
			"href" : "#",
			"alt" : "More...",
			"title" : "More...",
			"class" : "ms-more-link",
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
	}

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
	}	

	MenuSlicer.prototype.createSubMenu = function(subMenuItems, li){
		
		var $this = $(this.element),
			ul, i, l;

		//create list to hold subMenuItems
		ul = $('<ul>', {
			"class" : "ms-sub-menu"
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