;(function ( $, window, document, undefined ) {
 
	var pluginName = 'ik_treemenu',
		defaults = {
			'instructions': 'Use up or down arrows to move through menu items, and Enter or Spacebar to toggle submenus open and closed.',			
			'menuTitle': 'Breakfast Menu',
			'expandAll': true,
		};
	 
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;
		
		this.init();
	}
		
	Plugin.prototype.init = function () {
		
		var id, $elem, plugin;
		
		plugin = this;
		$elem = plugin.element;
		id = 'tree' + $('.ik_treemenu').length; // create unique id
				
		$elem
			.addClass('ik_treemenu')
			.attr({
        'tabindex': 0,
        'aria-labelledby': id + '_instructions'
        })
      ;
		
		// add div element to be used with aria-labelledby attribute of the menu
		$('<div/>') 
			.text(plugin.options.instructions) // get instruction text from plugin options
			.addClass('ik_readersonly') // hide element from visual display
			.attr({
				'id': id + '_instructions', 
				'aria-hidden': 'true'  // hide element from screen readers to prevent it from being read twice
			})
			.appendTo($elem);
		
		// add menu title
		$('<div/>') 
			.addClass('title')
			.text( this.options.menuTitle )
			.attr({ 
				'id': id + '_title'
			})
			.prependTo($elem);
		
		// set topmost ul element as a tree container
		$elem 
			.find('ul:first')  
			.attr({
				'id': id,				
        'role': 'tree', // assign tree role
        'aria-labelledby': id + '_title' // label with tree title
			});
		
		// set all li elements as tree folders and items
		$elem 
			.find('li')
			.css({ 'list-style': 'none' })
			.each(function(i, el) {
				
				var $me;
				
				$me = $(el);
				
				$me.attr({
					'id': id + '_menuitem_' + i,
			    'role': 'treeitem', // assign treeitem role
			    'tabindex': -1, // remove from tab order
			    'aria-level': $me.parents('ul').length, // add tree level
			    'aria-setsize': $me.siblings().length + 1, // define number of treeitems on the current level
			    'aria-posinset': $me.parent().children().index($me) + 1 // define position of the current element on the current level					

				});
				
				$($me.contents()[0]).wrap('<span></span>'); // wrap text element of each treitem with span element
				
				if ($me.children('ul').length) {  // if the current treeitem has submenu       
				        if (plugin.options.expandAll) { // expand or collapse all tree levels based on configuration
				            $me.attr({
				                'aria-expanded': true
				            })
				            ;
				        } else {
				            $me
				     .attr({
				            'aria-expanded': false
				        })        
				      .addClass('collapsed');
				}

				// not so sure
				$me
				    .attr({
				        'aria-label': $me.children('span:first').text()
				    })
				    .children('span')
				    .addClass('folder')
				    .attr({
				       'role': 'presentation'
				    })
				    ;          
				} else {           
				    $me.attr({'aria-selected': false});            
				}				
				// not so sure
			
			})
			.on('click', {'plugin': plugin}, plugin.onClick)
			.on('keydown', {'plugin': plugin}, plugin.onKeyDown);

			$elem // make the first treeitem focusable
    		.find('li:first')
    		.attr({
        	'tabindex': 0
    		});
		
	};
	
	Plugin.prototype.selectItem = function($item, plugin) {
    
    var $elem = plugin.element;
   
    $elem.find('[aria-selected=true]') // remove previous selection
        .attr({
            'tabindex': -1,
            'aria-selected': false
        });
   
    $elem.find('.focused') // remove highlight form previousely selected treeitem
        .removeClass('focused');
   
    $elem.find('li').attr({ // remove all treeitems from tab order
        'tabindex': -1
    })
   
    $item.attr({ // select specified treeitem
        'tabindex': 0, // add selected treeitem to tab order
        'aria-selected': true
    });
   
    if ($item.children('ul').length) { // highlight selected treeitem
        $item.children('span').addClass('focused');
    } else {
        $item.addClass('focused');
    }
   
    $item.focus();

  };
	
	Plugin.prototype.toggleSubmenu = function($item) {
       
		// check if the treeitem contains submenu       
    if($item.children('ul').length) { 
       
      if ($item.hasClass('collapsed')) {  
      // expand if collapsed
        
        $item.attr({
         	'aria-expanded': true
        })
        .removeClass('collapsed');
      
      } else {
      // otherwise collapse                            
            
        $item.attr({
          'aria-expanded': false
        })
    		.addClass('collapsed');
        
      }
    
    }
  
  };
	
	Plugin.prototype.onMouseOver = function (event) {
		
		var plugin = event.data.plugin,
					$me = $(event.currentTarget);
		
		event.stopPropagation();
		
		// remove highlight form previous treeitem
		plugin.element 
			.find('.mouseover')
			.removeClass('mouseover');
		
		// add highlight to currently selected treeitem
		$me.children('span') 
			.addClass('mouseover'); 
		
	};
	
	Plugin.prototype.onClick = function (event) {
		
		var plugin = event.data.plugin,
			$me = $(event.currentTarget);
		
		event.preventDefault();
		event.stopPropagation();
		
		plugin.toggleSubmenu($me);
		plugin.selectItem($me, plugin);

	};
   
  Plugin.prototype.onKeyDown = function (event) {
     
    var plugin, $elem, $me, $visibleitems, curindex, newindex;
   
    plugin = event.data.plugin;
    $elem = plugin.element;
    $me = $(event.currentTarget);
   
    switch (event.keyCode) {
      
      case ik_utils.keys.down:
        event.preventDefault();
        event.stopPropagation();
       
        $visibleitems = $elem.find('[role=treeitem]:visible');
        newindex = $visibleitems.index($me) + 1;
       
        if (newindex < $visibleitems.length) {
            plugin.selectItem( $($visibleitems[newindex]), plugin );
        }
        break;
      
      case ik_utils.keys.up:
        event.preventDefault();
        event.stopPropagation();
       
        $visibleitems = $elem.find('[role=treeitem]:visible');
        newindex = $visibleitems.index($me) - 1;
       
        if (newindex > -1) {
            plugin.selectItem( $($visibleitems[newindex]), plugin );
        }
        break;
      
      case ik_utils.keys.right:
        event.preventDefault();
        event.stopPropagation();
       
        if($me.attr('aria-expanded') == 'false') {
            plugin.toggleSubmenu($me);
        }
        break;
      
      case ik_utils.keys.left:
        event.preventDefault();
        event.stopPropagation();
       
        if($me.attr('aria-expanded') == 'true') {
            plugin.toggleSubmenu($me);
        }
        break;
      
      case ik_utils.keys.enter:
      case ik_utils.keys.space:
        event.preventDefault();
        event.stopPropagation();
       
        plugin.toggleSubmenu($me);
       
        return false;
    }
     
  };	
	
	$.fn[pluginName] = function ( options ) {
		
		return this.each(function () {
			
			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}
			
		});
		
	}
 
})( jQuery, window, document );