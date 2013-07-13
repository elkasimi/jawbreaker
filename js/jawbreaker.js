var canvas = null;
var score = 0;
var circles = null;
var colors = null;
var width = 400;
var height = 400;
var step = 40;
var stepBy2 = 20;
var offsetX = 0;
var offsetY = 0;
var radius = 18;
var radiusSquare = radius * radius;
var neighbours = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
];

var availableTime = 300;

var interval = null;

function tick() {
	if(availableTime > 0) { 
		--availableTime;
		var mm = Math.floor(availableTime / 60);
		var ss = availableTime % 60;
		var at = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
		document.getElementById('availableTime').innerHTML = '<b>' + at + '</b>';
	} else {
		if(interval) clearInterval(interval);
		
		alert('Game ended! No time left!');
		if (confirm('Do you want to play another game?')) {
			startNewGame();
		}
	}
}

function init() {
    canvas = document.getElementById('gCanvas');
    canvas.width = width;
    canvas.height = height;
    score = 0;
    colors = [];
    colors.push("rgb(200,0,0)");
    colors.push("rgb(0,200,0)");
    colors.push("rgb(0,0,200)");
    colors.push("rgb(200,200,0)");
    colors.push("rgb(200,0,200)");
    circles = [];
    for (var i = 0; i < width; i += step) {
        a = [];
        for (var j = 0; j < height; j += step) {
            var c = {};
            c.x = i + radius;
            c.y = j + radius;
            c.selected = false;
            c.destroyed = false;
            var idx = Math.floor(colors.length * Math.random());
            c.color = colors[idx];
            a.push(c);
        }
        //console.log(a.length);
        circles.push(a);
    }
    
    availableTime = 180;
    
    interval = setInterval(tick, 1000);

    //offsetX = canvas.offsetLeft;
    //offsetY = canvas.offsetTop;
    //alert('len = ' + circles.length);
}

function swap(c1, c2) {
    var color = c1.color;
    c1.color = c2.color;
    c2.color = color;
    c1.destroyed = false;
    c1.selected = false;
    c2.destroyed = true;
    c2.selected = false;
}

function update() {
    for (var i = 0; i < circles.length; ++i) {
        var done = false;
        while (!done) {
            done = true;
            for (var j = 1; j < circles[i].length; ++j) {
                var c1 = circles[i][j];
                var c2 = circles[i][j - 1];
                if (c1.destroyed && !c2.destroyed) {
                    done = false;
                    swap(c1, c2);
                }
            }
        }
    }
    var l = circles.length;
    var c = circles[0].length;
    for (var j = 0; j < c; ++j) {
        var done = false;
        while (!done) {
            done = true;
            for (var i = 1; i < l; ++i) {
                var c1 = circles[i][j];
                var c2 = circles[i - 1][j];
                if (c1.destroyed && !c2.destroyed) {
                    done = false;
                    swap(c1, c2);
                }
            }
        }
    }
}

function playExplositionSound() {
    //document.getElementById("soundPlayer").innerHTML = '<embed src="sounds/explosion.mp3" hidden="true" autostart="true" loop="false" />';
}

function onMouseClick(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    //alert('(' + x + ',' + y + ') clicked!');
    var c = null;
    var ii = -1;
    var jj = -1;
    for (var i = 0; i < circles.length && ii === -1; ++i) {
        for (var j = 0; j < circles[i].length; ++j) {
            c = circles[i][j];
            if (!c.destroyed) {
                //console.log(c.x + ',' + c.y);
                var dx = c.x - x;
                var dy = c.y - y;
                //console.log(dx + ',' + dy);
                var d = dx * dx + dy * dy;
                if (d <= radiusSquare) {
                    ii = i;
                    jj = j;
                    break;
                }
                else {
                    c = null;
                    //console.log(d);
                }
            }
        }

    }
    if (ii != -1) c = circles[ii][jj];
    else c = null;
    if (c) {
        if (c.destroyed) {}
        else if (c.selected) {
            var count = 0;
            for (var i = 0; i < circles.length; ++i) {
                for (var j = 0; j < circles[i].length; ++j) {
                    if (circles[i][j].selected) {
                        ++count;
                    }
                }
            }

            if (count > 1) {
                for (var i = 0; i < circles.length; ++i) {
                    for (var j = 0; j < circles[i].length; ++j) {
                        if (circles[i][j].selected) {
                            circles[i][j].destroyed = true;
							circles[i][j].selected = false;
                        }
                    }
                }

                score += count * (count - 1);
                document.getElementById('score').innerHTML = '<b>Score : ' + score + '</b>';

                playExplositionSound();
            }
        }
        else {
            for (var i = 0; i < circles.length; ++i) {
                for (var j = 0; j < circles[i].length; ++j) {
                    circles[i][j].selected = false;
                }
            }
            var q = [];
            q.push([ii, jj]);
            c.selected = true;
            while (q.length != 0) {
                //console.log(q);
                var top = q[0];
                q.shift(1);
                var m = top[0];
                var n = top[1];
                for (var i = 0; i < neighbours.length; ++i) {
                    xx = m + neighbours[i][0];
                    yy = n + neighbours[i][1];
                    if (xx >= 0 && xx < circles.length && yy >= 0 && yy < circles[xx].length && circles[xx][yy].selected === false && circles[xx][yy].color == c.color && circles[xx][yy].destroyed === false) {
                        circles[xx][yy].selected = true;
                        q.push([xx, yy]);
                    }
                }
            }
        }
        update();
        draw();
        //console.log([ii, jj]);

		var endGame = true;
		for (var i = 0; i < circles.length && endGame; ++i) {
			for (var j = 0; j < circles[i].length; ++j) {
				if (!circles[i][j].destroyed) {
					for (var k = 0; k < neighbours.length; ++k) {
						var xx = i + neighbours[k][0];
						var yy = j + neighbours[k][1];
						if (xx >= 0 && xx < circles.length && yy >= 0 && yy < circles[xx].length && !circles[xx][yy].destroyed && circles[xx][yy].color == circles[i][j].color) {
							endGame = false;
							break;
						}
					}
				}
			}
		}

		if (endGame) {
			if(interval) clearInterval(interval);
			alert('Game ended! No move left!');
			if (confirm('Do you want to play another game?')) {
				startNewGame();
			}
		}
    }
    else {
        //alert('clicking in an empty area!');
    }
}

function draw() {
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        for (var i = 0; i < circles.length; ++i) {
            for (var j = 0; j < circles[i].length; ++j) {
                var c = circles[i][j];
                if (c.destroyed) continue;
                ctx.fillStyle = c.color;
                ctx.beginPath();
                ctx.arc(c.x, c.y, radius, 0, 2 * Math.PI, false);
                ctx.fill();
                if (c.selected) {
                    ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
                    ctx.fillRect(c.x - stepBy2, c.y - stepBy2, step, step);
                }
            }
        }
        canvas.addEventListener("mousedown", onMouseClick, false);
    }
    else {
        alert('Can\'t get the 2d context!');
    }
}

function startNewGame() {
    init();
    draw();
}