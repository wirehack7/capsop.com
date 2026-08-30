// "Matrix" rain easter egg. Toggles: first click on the paragraph icon starts
// it, clicking the rain (or the icon again, or Escape) stops it.
(function () {
	var timer = null;
	var onResize = null;
	var onKey = null;

	function stop() {
		if (!timer) return;
		clearInterval(timer);
		timer = null;
		window.removeEventListener('resize', onResize);
		document.removeEventListener('keydown', onKey);
		onResize = onKey = null;

		document.body.style.overflow = '';
		var c = document.getElementById('c');
		if (c) {
			c.getContext('2d').clearRect(0, 0, c.width, c.height);
			c.width = c.height = 0;
			c.style.pointerEvents = 'none';
			c.onclick = null;
		}
		if (window.umami) window.umami.track('easter-egg', { action: 'stop' });
	}

	function start() {
		var c = document.getElementById('c');
		if (!c) return;
		var ctx = c.getContext('2d');

		document.body.style.overflow = 'hidden';
		c.height = window.innerHeight;
		c.width = window.innerWidth;
		c.style.pointerEvents = 'auto';
		c.onclick = stop;

		onResize = function () {
			c.height = window.innerHeight;
			c.width = window.innerWidth;
		};
		window.addEventListener('resize', onResize);

		onKey = function (e) {
			if (e.key === 'Escape') stop();
		};
		document.addEventListener('keydown', onKey);

		var chinese = '田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑'.split('');
		var font_size = 10;
		var columns = c.width / font_size;
		var drops = [];
		for (var x = 0; x < columns; x++) drops[x] = 1;

		// Match the current theme: classic green-on-black in dark mode,
		// ink-on-paper in light mode.
		var dark = document.documentElement.getAttribute('data-theme') === 'dark';
		var fade = dark ? 'rgba(10, 12, 16, 0.08)' : 'rgba(255, 255, 255, 0.05)';
		var glyph = dark ? '#00a828' : '#000';

		function draw() {
			ctx.fillStyle = fade;
			ctx.fillRect(0, 0, c.width, c.height);
			ctx.fillStyle = glyph;
			ctx.font = font_size + 'px arial';
			for (var i = 0; i < drops.length; i++) {
				var text = chinese[Math.floor(Math.random() * chinese.length)];
				ctx.fillText(text, i * font_size, drops[i] * font_size);
				if (drops[i] * font_size > c.height && Math.random() > 0.975) drops[i] = 0;
				drops[i]++;
			}
		}

		timer = setInterval(draw, 55);
		if (window.umami) window.umami.track('easter-egg', { action: 'start' });
	}

	window.matrix = function () {
		if (timer) stop(); else start();
	};
})();
