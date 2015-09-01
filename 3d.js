$(document).ready(function () {
    var items = document.getElementsByTagName('canvas'), ids = [];
    for (var i = 0; i < items.length; i++) 
		if (items[i].id.indexOf('img') == 0)
			initialize(items[i].id);
});

function getPosition(mouseEvent, sigCanvas) {
	var x, y;
	if (mouseEvent.pageX != undefined && mouseEvent.pageY != undefined) {
		x = mouseEvent.pageX;
		y = mouseEvent.pageY;
	} else {
		x = mouseEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = mouseEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	return { X: x - sigCanvas.offsetLeft, Y: y - sigCanvas.offsetTop };
}
	  
function initialize(rot_name) {
	var example = document.getElementById(rot_name);
	var ctx = example.getContext('2d');
	var timerId = 0;
	var position = 0;
	example.height = 426;
	example.width = 640;
	var steps = 36;
	var step = 0;
	var pic = {};  
	var progress = 0;
	var is_touch_device = 'ontouchstart' in document.documentElement;

	if (is_touch_device) {
		var drawer = {
			isDrawing: false,
			touchstart: function (coors) {
				this.isDrawing = true;
				position = coors;
				clearInterval(timerId);
			},
			touchmove: function (coors) {
				if (this.isDrawing) {
					var diff =  step + Math.floor((coors.x - position.x)/10);
					if (diff >= 0)
						ctx.drawImage(pic[diff % steps], 0, 0);
					else
						ctx.drawImage(pic[steps - 1 + diff % steps], 0, 0);
				}
			},
			touchend: function (coors) {
				if (this.isDrawing) {
					this.touchmove(coors);
					this.isDrawing = false;
					var diff =  step + Math.floor((coors.x - position.x)/10);
					step = diff % steps;
					if (diff < 0)
						step += steps - 1;
				}
			}
		};

		function draw(event) {
			var coors = {
				x: event.targetTouches[0].pageX,
				y: event.targetTouches[0].pageY
			};
			var obj = example;

			if (obj.offsetParent) {
				do {
					coors.x -= obj.offsetLeft;
					coors.y -= obj.offsetTop;
				}
				while ((obj = obj.offsetParent) != null);
			}
			drawer[event.type](coors);
			}

		example.addEventListener('touchstart', draw, false);
		example.addEventListener('touchmove', draw, false);
		example.addEventListener('touchend', draw, false);

		example.addEventListener('touchmove', function (event) {
			event.preventDefault();
		}, false); 
	}
	else {
		$("#" + rot_name).mousedown(function (mouseEvent) {
			position = getPosition(mouseEvent, example);
			clearInterval(timerId);
			$(this).mousemove(function (mouseEvent) {
				drawLine(mouseEvent, example, ctx);
			}).mouseup(function (mouseEvent) {
				finishDrawing(mouseEvent, example, ctx);
			}).mouseout(function (mouseEvent) {
				finishDrawing(mouseEvent, example, ctx);
			});
		});
	}
	 
	for(i=0;i<steps;i++){
		pic[i] = new Image();
		pic[i].src = './' + rot_name + '/' + rot_name + '_';
		if (i<10)
			pic[i].src += '0';
		pic[i].src += i + '.jpg';  
		pic[i].onload = function() {
			progress++;
			ctx.save();
			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect(0, 0, example.width, example.height);
			ctx.restore();
			ctx.beginPath();
			ctx.strokeStyle = '#000000';
			//borders
			ctx.moveTo(10, example.height-7);
			ctx.lineTo(10, example.height-1);
			ctx.moveTo(example.width-10, example.height-7);
			ctx.lineTo(example.width-10, example.height-1);
			//progress
			ctx.strokeStyle = '#666666';
			ctx.moveTo(10, example.height-4);
			ctx.lineTo(10 + example.width-20, example.height-4); 
			ctx.strokeStyle = '#000000';
			ctx.moveTo(10, example.height-4);
			ctx.lineTo(10 + progress*(example.width-20)/steps, example.height-4); 
			ctx.stroke();
			if(progress==steps)
				timerId = setInterval(function() {          
					ctx.drawImage(pic[step++], 0, 0);
					if(step >= steps) step = 0;
				}, 1000/steps*3);

		}
	}
 
	function drawLine(mouseEvent, sigCanvas, context) {
		var positions = getPosition(mouseEvent, sigCanvas);
		var diff =  step + Math.floor((positions.X - position.X)/10);
		if (diff >= 0)
			context.drawImage(pic[diff % steps], 0, 0);
		else
			context.drawImage(pic[steps - 1 + diff % steps], 0, 0);
	}
 
	function finishDrawing(mouseEvent, sigCanvas, context) {
		drawLine(mouseEvent, sigCanvas, context);
		var positions = getPosition(mouseEvent, sigCanvas);
		var diff =  step + Math.floor((positions.X - position.X)/10);
		step = diff % steps;
		if (diff < 0)
			step += steps - 1;
		$(sigCanvas).unbind("mousemove")
					.unbind("mouseup")
					.unbind("mouseout");
	}
}