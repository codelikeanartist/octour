// Custom JS code can go here

// You can customize Reveal options:
// slide size:
Reveal.configure({width:1200});
Reveal.configure({height:700});

//Reveal.configure({});
//Reveal.configure({"center": false});
Reveal.configure({center: false});
Reveal.configure({ slideNumber: true });
Reveal.configure({ slideNumber: 'c/t' });
//Reveal.configure({parallaxBackgroundImage:"images/genealogy2.jpg"});
Reveal.configure({parallaxBackgroundImage:"images/rtl2.jpg"});
Reveal.configure({parallaxBackgroundSize:"3034px 1122px"});
// add chalkboard keyboard shorcuts
Reveal.configure({keyboard:{
    46: function() { RevealChalkboard.clear()},
    68: function() { RevealChalkboard.download()}
}});

Reveal.configure({ pdfMaxPagesPerSlide: 1 }) ;

/*
Reveal.initialize(keyboard: {
	    67: function() { RevealChalkboard.toggleNotesCanvas() },	// toggle notes canvas when 'c' is pressed
	    66: function() { RevealChalkboard.toggleChalkboard() },	// toggle chalkboard when 'b' is pressed
	    46: function() { RevealChalkboard.clear() },	// clear chalkboard when 'DEL' is pressed
	     8: function() { RevealChalkboard.reset() },	// reset chalkboard data on current slide when 'BACKSPACE' is pressed
	    68: function() { RevealChalkboard.download() },	// downlad recorded chalkboard drawing when 'd' is pressed
	});
*/

// (an outdated version of) http://headjs.com/ is also loaded
head.ready("lodash.min.js", function () {
  // LoDash can be used from here
});
head.js("js/lodash.min.js");

// chalkboard
head.ready("chalkboard.js", function () {
});
head.js("plugin/chalkboard/chalkboard.js");

//chalboard plugin
//head.ready("chalkboard.js", function () {
//});


//math
Reveal.configure({"math" : {"mathjax":"js/MathJax.js"}});

head.ready("math.js", function () {
	console.log("math");
});
head.js("plugin/math/math.js");

