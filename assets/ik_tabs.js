;(function ( $, window, document, undefined ) {
	 
	var pluginName = 'ik_tabs',
			defaults = {
				tabLocation: 'top',
				selectedIndex: 0
			};
	
	function Plugin( element, options ) {
		
		this._name = pluginName;															// via global variable
		this._defaults = defaults;														// via global variable
		this.element = $(element);														// via parameter
		this.options = $.extend( {}, defaults, options);			// via parameter
		
		this.init();																					// call function below

	}
	
	// FUNCTION to initialize accessible tab panel and tabs
	Plugin.prototype.init = function () {
		
		var id, $elem, $tabbar, pad;		
		plugin = this;
		
		// create unique id based on number of items inside .tabs
		id = 'tabs' + $('.ik_tabs').length; 
		
		// add ik_tabs class to each element selected in html
		$elem = this.element.addClass('ik_tabs');
		
		// CUSTOMIZING the SEMANTIC HTML
		// create ul element to hold all tabs
		// removing list semantics and adding tablist semantics
		// place the <ul> at the beginning of the tabs element 
		$tabbar = $('<ul/>') 
			.addClass('ik_tabbar cf')
			.attr({
				'role': 'tablist' 
			})
			.prependTo($elem);	
		
		// initialize panels and create tabs in selector-ed elements
		plugin.panels = $elem 
			.children('div')
			.each(function(i, el) {
				
				// for each tab element insert attributes
				var $panel, lbl, $tab;
				
				// ADDING WAI-ARIA to the PANELS
				// adding unique id for a tab panel					
				// adding "tabpanel" WAI-ARIA role
				// adding "aria-hidden" state, "tabindex" and ".ik_tabpanel" to each tab
				// hiding each tab
				$panel = $(el).attr({
						'id': id + '_panel' + i,  
						'role': 'tabpanel',
						'aria-hidden' : true, 
						'tabindex' : 0 
					})
					.addClass('ik_tabpanel')
					.hide();
				
				// LABELLING PANEL
				// remove default title from tab panel
				// get tab label from panel title
				// give each tab an id, a role and the aria-control
				// make text the label or the Tab # if no label
				// if keydown to this go to this tab
				// if clicked to this go to this tab
				// place the tab at the end of the inside of the tab panel							
				$panel.removeAttr('title');				
				lbl = $panel.attr('data-title'); 				
				$tab = $('<li/>').attr({
						'id': id + '_tab' + i, // create unique id for a tab
						'role': 'tab', // assigning tab role
						'aria-controls' : 'panel' + i // defining controlled panel
					})
					.text(lbl > '' ? lbl : 'Tab ' + (i + 1))					
					.on('keydown', {'plugin': plugin, 'index': i}, plugin.onKeyDown)
					.on('click', {'plugin': plugin, 'index': i}, plugin.selectTab) 
					.appendTo($tabbar);

			});
		
		plugin.tabs = $tabbar.find('li');
		
		// select a pre-defined tab / panel 
		plugin.selectTab({ 
			data : {
				'plugin': plugin, 
				'index': plugin.options.selectedIndex
			}
		});

	};
	
	// FUNCTION to select specific tab
	Plugin.prototype.selectTab = function (event) {
		
		var plugin = event.data.plugin, 
			ind = event.data.index, 
			$tabs, 
			$panels;
		
		$elem = plugin.element;
		$tabs = plugin.tabs;
		$panels = plugin.panels;
		
		// deselect all tabs + remove tabindex temporarily + remove focus
		$tabs 
			.removeClass('selected')
			.attr({
				'aria-selected' : false,
				'tabindex' : -1 // remove them from tab order
			})
			.blur();
		
		// select specified tab based on event
		$($tabs[ind]) 
			.addClass('selected')
			.attr({
				'aria-selected': true,
				tabindex: 0
			}).focus();
		
		// move focus to current tab if reached by mouse or keyboard
		if (event.type) $($tabs[ind]).focus(); 
		
		// hide all panels
		$panels 
			.attr({
				'aria-hidden' : true
			})
			.hide(); 
		
		// show current panel
		$($panels[ind]) 
			.attr({
				'aria-hidden' : false
			})
			.show(); 
		
	}

	// FUNCTION to enable keyboard operability
	Plugin.prototype.onKeyDown = function (event) {

    var plugin = event.data.plugin,
        ind = event.data.index,
        $tabs,
        $panels,
        next;
           
    $elem = plugin.element;
    $tabs = plugin.tabs;
    $panels = plugin.panels;    
       
    switch (event.keyCode) {
        
        // for left and up key -> go to next lowest-indexed tab or leftmost tab
        case ik_utils.keys.left:
        case ik_utils.keys.up:
          next = ind > 0 ? --ind : 0;
          plugin.selectTab({data:{'plugin': plugin, 'index': next}});
          break;
        // for the right and down key -> go to the next highest-indexed tab or rightmost tab
        case ik_utils.keys.right:
        case ik_utils.keys.down:
          next = ind < $tabs.length - 1 ? ++ind : $tabs.length - 1;
          plugin.selectTab({data:{'plugin': plugin, 'index': next }});          
          break;
        // for the space key -> 
        case ik_utils.keys.space:
          event.preventDefault();
          event.stopPropagation();
          return false;
    }
	
	}
	
	$.fn[pluginName] = function ( options ) {
		
		return this.each(function () {
			
			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}
			
		});
		
	}
 
})( jQuery, window, document );