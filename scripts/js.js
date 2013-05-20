(function($) {
    $(function() {

		// verify that user has JS turned on
		$('html').removeClass('no-js');


		$(".icon")
			.find("i")
			.hide()
			.end()
			.hover(function() {
				$(this).find("i").stop(true, true).fadeIn('300');
			}, function() {
				$(this).find("i").stop(true, true).fadeOut('300');
		});

		/* определяем на какой странице находимся */
		var isindex = ($('body').attr('id') == 'index') ? true : false;
		// console.log(isindex);	

		/* запускаем скрипт выравнивания блоков в секциях */
		if(isindex) {
			$('.wall-section').masonry({
			  itemSelector: '.brick',
			});
		}

		/* запускаем скрипт стилизованого скролла */
		$(".wall-outer").mCustomScrollbar({
		    horizontalScroll:true,
		    mouseWheelPixels: 336,
		    advanced:{
		        updateOnContentResize: true,
		        updateOnBrowserResize: true
		    },
		    callbacks:{
		        whileScrolling:function(){
			        checkActiveSection();
			        /* это место хорошо бы оптимизировать
			           т.к. функция вызывается большое количество раз,
			           что несколько замедляет работу. 
			           В теории, на слабых машинках может подтупливать */
		        },
		        // onScroll: function(){
		        // 	checkActiveSection();
		        // },
		        onTotalScroll:function(){
		        	scolledToLast();
		        },
		        onTotalScrollOffset:50
		    }
		});

	

		/* определяем, какое именно меню будет обслуживаться скриптами */
		var menuBox = isindex ? '.main' : '.sub';
		// console.log(menuBox);		

		/* забираем из DOM данные о ширине и количестве секций */
		var sectionWidth = new Array(); 
		var sectionsCount = $('.wall .wall-section').length;
		var widthIntervals = new Array();

		function updateIntervals () {
			$( ".wall-section" ).each(function( index ) {
				var w = $(this).width();
				sectionWidth[index] = w;
				if ( index > 0 ) { 
					widthIntervals[index] = widthIntervals[index-1] + w;
				} else {
					widthIntervals[index] = w;
				}
			});	
			// console.log('intervals updated');
		}
		
		updateIntervals();

		// console.log( sectionsCount );
		// console.log( sectionWidth );
		// console.log( widthIntervals );

		/* отслеживаем прокрутку скролла, чтобы проставлять активный класс в меню */
		// $(".mCSB_container").watch('left', function(){
		// 	checkActiveSection();
		// });	
		
		/* проставляем активный класс в верхнем меню */
		function checkActiveSection() {		
			var x =  $(".mCSB_container").position().left;
			//console.log(x);
			for (i = 0; i < sectionsCount; i++ ) {
				var roundingError = 5; /* расширяем интервалы - делаем запас на погрешности округления */
				// console.log(widthIntervals);
				if (!isindex) updateIntervals();
				if ( ( x >= -widthIntervals[i]-roundingError && x <= -(widthIntervals[i]-sectionWidth[i]-roundingError) ) ) {
					$(menuBox+' li.active').removeClass('active');
					$(menuBox+' li').eq(i).addClass('active');
					setLocation();
				} 
			}		
			// console.log('checkActiveSection');		 
		}

		/* проставляем активным последниый пункт */
		/* актуально в том случае, когда его ширина меньше ширины экрана */
		function scolledToLast() {
			$(menuBox+' li.active').removeClass('active');
			$(menuBox+' li').eq(sectionsCount-1).addClass('active');
			setLocation();
		}

	    /* проматываем слайдер при клике в верхнем меню */		
		$(menuBox+' a').on('click', function(e){
			e.preventDefault();
			if ( $(this).parent().hasClass('active') ) return;
			var index = $(menuBox+' a').index(this);
			var id = '#section-'+(index+1);
			$(".wall-outer").mCustomScrollbar('scrollTo',id);	
			// console.log(id);	
		});


		/* для внутренних страниц */
		if (!isindex) {

			function updateScroll () {
				var w = $('.wall').width();
				$('.mCSB_container').width(w);
				$(".wall-outer").mCustomScrollbar("update");
			}

			var paddings = parseInt($('.contentWidth').css('padding-left')) + parseInt($('.contentWidth').css('padding-right'));
			//console.log(paddings);

			function setBricksWidth () {
				var w =  $(window).width();
				$('.brick').width(w-paddings);
			}

			function setSectionsWidth () {				
				$( '.wall-section' ).each(function () {
					var obj = $(this);
					var num = obj.children('.brick').length;
					var childWidth = $('.brick').width();
					obj.width( childWidth*num );
					// console.log( obj.width() );
					updateScroll();				
				});	
			}

			function setWallWidth () {
				var wallWidth = 0;

				$( '.wall-section' ).each(function () {
					var obj = $(this);
					var w = obj.width();
					wallWidth += w;								
				});	
				// console.log(wallWidth);
				$('.wall').width(wallWidth);
				updateScroll();	
			}

			$(window).resize(function() {
				window.setTimeout(function() {
			    	setBricksWidth();
					setSectionsWidth();
					setWallWidth();
					updateIntervals();
					updateScroll();	
					checkLocation();    
			    }, 50);				
			});	

			setBricksWidth();
			setSectionsWidth();
			setWallWidth();

		}


		/* проставляем хэш в зависимости от активного пункта меню */
		function setLocation() {
			var href = $(menuBox+' li.active a').attr('href');
			var hash = window.location.hash;	
			if ( hash != href ) {
				window.location.hash = href;
				// console.log(hash);	
			}
			// console.log('setLocation');				
		}

		/* функция проверки хеша */
		/* чтобы промотать к нужному разделу */
		function checkLocation(){
			var h = window.location.hash;
			if ( h == "" ) {
				setLocation();
			} else {
				$( menuBox+" a" ).each(function () {
					if ( $(this).attr('href') == h ) {
						var index = $(menuBox+' a').index(this);
						var id = '#section-'+(index+1);
						if (!isindex) {
							updateIntervals();
							/* запускаем промотку до активного раздела через интервал, 
						       чтобы успела проставиться ширина всем блокам */
							window.setTimeout(function() {
						        $(".wall-outer").mCustomScrollbar("scrollTo",id/*,{scrollInertia:300}*/);
						    }, 500);		
					    } else {
					    	$(".wall-outer").mCustomScrollbar("scrollTo",id/*,{scrollInertia:300}*/);
					    }
					}
				});			
			}	
		}
		/* проверяем хеш при первом заходе на страницу */
		checkLocation();	

    })
})(jQuery)