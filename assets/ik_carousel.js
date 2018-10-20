;(function ( $, window, document, undefined ) {
	
	var pluginName = 'ik_carousel',
		defaults = { 
			'instructions': 'Carousel widget. Use left and right arrows to navigate between slides.',
			'animationSpeed' : 3000
		};
	 
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;
		
		this.init();
	
	};
		
	// FUNCTION to initialize accessible carousel and slides
	Plugin.prototype.init = function () {
		
		var id, plugin, $elem, $image, $controls, $navbar;
		
		plugin = this;
		id = 'carousel' + $('.ik_slider').length;
		$elem = plugin.element;
		
		$elem
			.attr({
				'id': id,
		    'role': 'region', 
		    'tabindex': 0, 
		    'aria-describedby': id + '_instructions'
			})
			.addClass('ik_carousel')
			.on('keydown', {'plugin': plugin}, plugin.onKeyDown)
			.on('focusin mouseenter', {'plugin': plugin}, plugin.stopTimer)
			.on('focusout mouseleave', {'plugin': plugin}, plugin.startTimer);
		
		$('<div/>') 
	    .attr({
	        'id': id + '_instructions',
	        'aria-hidden': 'true'
	    })
	    .text(this.options.instructions)
	    .addClass('ik_readersonly')
	    .appendTo($elem);    
		
		$('<div/>')
			.addClass('ik_button ik_prev')
			.on('click', {'plugin': plugin, 'slide': 'left'}, plugin.gotoSlide)
			.appendTo($controls);
		
		$('<div/>')
			.addClass('ik_button ik_next')
			.on('click', {'plugin': plugin, 'slide': 'right'}, plugin.gotoSlide)
			.appendTo($controls);

		$controls = $('<div/>')
	    .attr({
	        'aria-hidden': 'true' // hide controls from screen readers
	    })
	    .addClass('ik_controls')
	    .appendTo($elem);												

		$navbar = $('<ul/>')
			.addClass('ik_navbar')
			.appendTo($controls);
			
		plugin.slides = $elem
			.children('figure')
			.each(function(i, el) {
				var $me, $src;
				
				$me = $(el);
				$src = $me.find('img').remove().attr('src');
				
				$me.attr({
			    	'aria-hidden': 'true' // hide images from screen readers
			    })
					.css({
						'background-image': 'url(' + $src + ')'
					});	
				
				$('<li/>')
					.on('click', {'plugin': plugin, 'slide': i}, plugin.gotoSlide)
					.appendTo($navbar);

			});
		
		plugin.navbuttons = $navbar.children('li');
		plugin.slides.first().addClass('active');
		plugin.navbuttons.first().addClass('active');
		plugin.startTimer({'data':{'plugin': plugin}});
		
	};
	
	// FUNCTION to start the timer to animate between slides
	Plugin.prototype.startTimer = function (event) {
		
		var plugin;
		
		$elem = $(this);
		plugin = event.data.plugin;
		
		if(plugin.timer) {
			clearInterval(plugin.timer);
			plugin.timer = null;
		}

		if (event.type === 'focusout') {
		    plugin.element.removeAttr('aria-live');
		}
		
		plugin.timer = setInterval(plugin.gotoSlide, plugin.options.animationSpeed, {'data':{'plugin': plugin, 'slide': 'right'}});
		
	};
	
	// FUNCTION to stop the timer
	Plugin.prototype.stopTimer = function (event) {
		
		var plugin = event.data.plugin;

		clearInterval(plugin.timer);
		plugin.timer = null;
		
		if (event.type === 'focusin') {
		   plugin.element.attr({'aria-live': 'polite'});
		}

		
	};

	// FUNCTION to access specific slide
	Plugin.prototype.gotoSlide = function (event) {
		
		var plugin, n, $elem, $active, $next, index, direction, transevent;
		
		plugin = event.data.plugin;
		n = event.data.slide;
		$elem = plugin.element;
		$active = $elem.children('.active');
		index = $active.index();
		
		if (typeof n === 'string') {
			
			if(n === 'left') {
				direction = 'left';
				n = index == 0 ? plugin.slides.length - 1 : --index;
			} else {
				direction = 'right'
				n = index == plugin.slides.length - 1 ? 0 : ++index;
			}
			
		} else {
			if (index < n || (index == 0 && n == plugin.slides.length - 1)) {
				direction = 'left';
			} else {
				direction = 'right';
			}
		}
		
		$next = plugin.slides.eq(n).addClass('next');
		transevent = ik_utils.getTransitionEventName();
		$active.addClass(direction).on(transevent, {'next': $next, 'dir': direction}, function(event) {
			
			var active, next, dir;
			
			active = $(this);
			next = event.data.next;
			dir = event.data.dir;
			
			active
				.attr({
	        'aria-hidden': 'true'
	    	})
	    	.off( ik_utils.getTransitionEventName() )
				.removeClass(direction + ' active');				
				
			next
			  .attr({
        	'aria-hidden': 'false'
    		})		
				.removeClass('next')
				.addClass('active');
			
		}).focus();
		
		plugin.navbuttons.removeClass('active').eq(n).addClass('active');
		
	}

	// FUNCTION to allow keyboard operability
	Plugin.prototype.onKeyDown = function (event) {
       
  	var plugin = event.data.plugin;
     
  	switch (event.keyCode) {
         
      case ik_utils.keys.left:
          event.data = {'plugin': plugin, 'slide': 'left'};
          plugin.gotoSlide(event);
          break;
      case ik_utils.keys.right:
          event.data = {'plugin': plugin, 'slide': 'right'};
          plugin.gotoSlide(event);
          break;
      case ik_utils.keys.esc:
          plugin.element.blur();
          break;
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