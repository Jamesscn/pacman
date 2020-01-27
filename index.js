var canvasElement = document.getElementById("canvas")
var canvas = canvasElement.getContext("2d")

var lives = 3
var level = 1
var score = 0
var pacmanX = 0
var pacmanY = 0
var tileSize = 18
var dotRadius = 2
var megadotRadius = 5
var sizeX = 0
var sizeY = 0
var pacmanX = 0
var pacmanY = 0
var spawnX = 0
var spawnY = 0
var pacmanSubX = 0
var pacmanSubY = 0
var pacmanDirection = 0
var pacmanNextDirection = 0
var fruitX = 0
var fruitY = 0
var currentFruit = 0
var dots = -1
var loading = 200
var eating = 0
var eatScore = 200
var fruit = []
var fruitScores = [100, 300, 500, 700, 1000, 2000, 3000, 5000]
var modScore = 0
var mouthStretch = 0
var deathAnimation = 0
var mapString = "tvencdgdcfgfeh3dcecfcllllllllllGGGGhGGGGmlplp6lmlpt1A1Ap0p1RBmlmlBlBmmGGGGGGGGFplBBllpplBBmmlhlBBmmGFqF6GmGFllBl4hlpll06lkl5lA0k0pg000mg1g1B5g5hp05lmkg015Blg081004200llB400hpll06klll5A0k0pg000mg1g1B5llhp05lmklhl5BlmGGGF6GGGFplBlAplplBBmlmlBlBmnFqGGaGGmJlBBBllppplmmmlhlBBBmGFqF6GmGFplllAplllBBllmlBllmmGGGGGGGGFlllllllllk"
var ghosts = []
var colours = ["red", "pink", "cyan", "orange"]
var map = [[]]
var gates = []
var labels = []
var gameInterval = null

/*
	TODO:
	Add run mechanism when superpellet has been eaten
	Improve graphics
	Slower ghosts when running
	Fix AI
	Different exit times
	Music and effects
*/

window.onload = function () {
	//var str = "11111111111111111111111111111122222222222210122222222222211211112111112101211111211112113100121000121012100012100131121111211111211121111121111211222222222222222222222222222112111121121111111112112111121121111211211110111121121111211222222112222101222211222222111111121111101010111112111111100001211111011101111121000011000012110000000000011210000110000121101110001110112100001111111211010000000101121111110000002000100000001000200000011111121101000000010112111111100001211011111111101121000011000012110000000000011210000110000121101111111110112100001111111211011110111101121111111222222222222101222222222222112111121111121012111112111121121111211111211121111121111211322112222222202222222211223111121121121111111112112112111111211211211110111121121121111222222112222101222211222222112111111111121012111111111121121111111111211121111111111211222222222222222222222222222111111111111111111111111111111"
	//console.log(encode(str))
	for(var i = 0; i < 4; i++) {
		ghosts[i] = {
			x: 0,
			y: 0,
			subX: 0,
			subY: 0,
			spawnX: 0,
			spawnY: 0,
			direction: 0,
			edible: false,
			dead: false,
			gating: true,
			leavingGate: false,
			leavingDirection: 0,
			colour: colours[i]
		}
	}
	for(var i = 0; i < 8; i++) {
		fruit[i] = {
			score: fruitScores[i],
			available: false,
			edible: false,
			timeout: 1000
		}
	}
	fruit[0].available = true
	decode(mapString)
	canvasElement.width = tileSize * sizeX;
	canvasElement.height = tileSize * (sizeY + 2);
	draw()
	gameInterval = setInterval(game, 1000/60)
}

document.addEventListener("keydown", function(event) {
	if(event.key == "d") {
		pacmanNextDirection = 0
	} else if (event.key == "w") { 
		pacmanNextDirection = 1
	} else if (event.key == "a") {
		pacmanNextDirection = 2
	} else if (event.key == "s") {
		pacmanNextDirection = 3
	}
})

function encode(string) {
	var newString = ""
	var alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/"
	for(var i = 0; i < string.length; i += 3) {
		var value = 0
		for(var j = 0; j < 3; j++) {
			value *= 4
			if(i + j < string.length) {
				value += parseInt(string[i + j])
			}
		}
		newString += alphabet[value]
	}
	return newString
}

function decode(string) {
	map = [[]]
	var alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/"
	sizeX = alphabet.indexOf(string[0])
	sizeY = alphabet.indexOf(string[1])
	spawnX = pacmanX = alphabet.indexOf(string[2])
	spawnY = pacmanY = alphabet.indexOf(string[3])
	for(var i = 0; i < 4; i++) {
		ghosts[i].spawnX = ghosts[i].x = alphabet.indexOf(string[4 + 2 * i])
		ghosts[i].spawnY = ghosts[i].y = alphabet.indexOf(string[5 + 2 * i])
	}
	fruitX = alphabet.indexOf(string[12])
	fruitY = alphabet.indexOf(string[13])
	gateCount = alphabet.indexOf(string[14])
	for(var i = 0; i < gateCount; i++) {
		gates.push({
			x: alphabet.indexOf(string[15 + i * 2]),
			y: alphabet.indexOf(string[16 + i * 2])
		})
	}
	var x = 0
	var y = 0
	var data = string.substring(15 + gateCount * 2)
	var mapDots = -1
	for(var i = 0; i < data.length; i++) {
		var value = alphabet.indexOf(data[i])
		var tiles = []
		for(var j = 0; j < 3; j++) {
			tiles[j] = Math.floor(value % 4)
			value /= 4
		}
		for(var j = 0; j < 3; j++) {
			map[y][x] = tiles[2 - j]
			if(map[y][x] == 2 || map[y][x] == 3) {
				mapDots++
			}
			x++
			if(x == sizeX) {
				x = 0
				y++
				if(y == sizeY) {
					break
				} else {
					map[y] = []
				}
			}
		}
	}
	dots = mapDots
}

function gateAt(x, y) {
	for(var i = 0; i < gates.length; i++) {
		if(gates[i].x == x && gates[i].y == y) {
			return true
		}
	}
	return false
}

function movePacman(direction, amount) {
	if(pacmanSubX == 0 && pacmanSubY == 0) {
		mouthStretch = 0
	} else if(pacmanSubX > tileSize / 2 || pacmanSubY > tileSize / 2 || pacmanSubX < -tileSize / 2 || pacmanSubY < -tileSize / 2) {
		mouthStretch = -0.3
	}
	if(direction == 0) {
		if(pacmanSubX == 0 && map[pacmanY][(pacmanX + 1) % sizeX] != 1 && gateAt((pacmanX + 1) % sizeX, pacmanY) == false) {
			pacmanSubX += amount
		} else if(pacmanSubX == tileSize) {
			pacmanX++
			pacmanSubX = 0
		} else if (pacmanSubX > 0) {
			pacmanSubX += amount
		}
	} else if (direction == 1) {
		if(pacmanSubY == 0 && map[(pacmanY - 1 + sizeY) % sizeY][pacmanX] != 1 && gateAt(pacmanX, (pacmanY - 1 + sizeY) % sizeY) == false) {
			pacmanSubY -= amount
		} else if(pacmanSubY == -tileSize) {
			pacmanY--
			pacmanSubY = 0
		} else if(pacmanSubY < 0) {
			pacmanSubY -= amount
		}
	} else if (direction == 2) {
		if(pacmanSubX == 0 && map[pacmanY][(pacmanX - 1 + sizeX) % sizeX] != 1 && gateAt((pacmanX - 1 + sizeX) % sizeX, pacmanY) == false) {
			pacmanSubX -= amount
		} else if(pacmanSubX == -tileSize) {
			pacmanX--
			pacmanSubX = 0
		} else if (pacmanSubX < 0) {
			pacmanSubX -= amount
		}
	} else {
		if(pacmanSubY == 0 && map[(pacmanY + 1) % sizeY][pacmanX] != 1 && gateAt(pacmanX, (pacmanY + 1) % sizeY) == false) {
			pacmanSubY += amount
		} else if(pacmanSubY == tileSize) {
			pacmanY++
			pacmanSubY = 0
		} else if (pacmanSubY > 0) {
			pacmanSubY += amount
		}
	}
	if(pacmanX == sizeX) {
		pacmanX = 0
	}
	if(pacmanY == sizeY) {
		pacmanY = 0
	}
	if(pacmanX == -1) {
		pacmanX = sizeX - 1
	}
	if(pacmanY == -1) {
		pacmanY = sizeY - 1
	}
}

function doBFS(ghost, endPoint) {
	var bfs = [[]]
	var queue = []
	for(var y = 0; y < sizeY; y++) {
		bfs[y] = []
		for(var x = 0; x < sizeX; x++) {
			bfs[y][x] = 10000000
		}
	}
	bfs[endPoint.y][endPoint.x] = 0
	queue.push(endPoint)
	var dir = ghost.direction
	while(queue.length > 0) {
		var point = queue.shift()
		if(point.x == ghost.x && point.y == ghost.y) {
			dir = point.dir
			break
		}
		if(map[point.y][(point.x + 1) % sizeX] != 1 && bfs[point.y][(point.x + 1) % sizeX] == 10000000) {
			queue.push({
				x: (point.x + 1) % sizeX,
				y: point.y,
				dir: 2
			})
			bfs[point.y][(point.x + 1) % sizeX] = bfs[point.y][point.x] + 1
		}
		if(map[(point.y - 1 + sizeY) % sizeY][point.x] != 1 && bfs[(point.y - 1 + sizeY) % sizeY][point.x] == 10000000) {
			queue.push({
				x: point.x,
				y: (point.y - 1 + sizeY) % sizeY,
				dir: 3
			})
			bfs[(point.y - 1 + sizeY) % sizeY][point.x] = bfs[point.y][point.x] + 1
		}
		if(map[point.y][(point.x - 1 + sizeX) % sizeX] != 1 && bfs[point.y][(point.x - 1 + sizeX) % sizeX] == 10000000) {
			queue.push({
				x: (point.x - 1 + sizeX) % sizeX,
				y: point.y,
				dir: 0
			})
			bfs[point.y][(point.x - 1 + sizeX) % sizeX] = bfs[point.y][point.x] + 1
		}
		if(map[(point.y + 1) % sizeY][point.x] != 1 && bfs[(point.y + 1) % sizeY][point.x] == 10000000) {
			queue.push({
				x: point.x,
				y: (point.y + 1) % sizeY,
				dir: 1
			})
			bfs[(point.y + 1) % sizeY][point.x] = bfs[point.y][point.x] + 1
		}
	}
	return dir
}

function searchAdjacent(ghost) {
	var wallLeft = ghost.direction == 0 && map[ghost.y][(ghost.x + 1) % sizeX] == 1
	var wallUp = ghost.direction == 1 && map[(ghost.y - 1 + sizeY) % sizeY][ghost.x] == 1
	var wallRight = ghost.direction == 2 && map[ghost.y][(ghost.x - 1 + sizeX) % sizeX] == 1
	var wallDown = ghost.direction == 3 && map[(ghost.y + 1) % sizeY][ghost.x] == 1
	var wallCount = (map[ghost.y][(ghost.x + 1) % sizeX] == 1) + (map[(ghost.y - 1 + sizeY) % sizeY][ghost.x] == 1) + (map[ghost.y][(ghost.x - 1 + sizeX) % sizeX] == 1) + (map[(ghost.y + 1) % sizeY][ghost.x] == 1)
	var queue = []
	if(wallLeft || wallUp || wallRight || wallDown || wallCount < 2) {
		var point = {
			x: ghost.x,
			y: ghost.y,
			dir: ghost.direction
		}
		if(map[point.y][(point.x + 1) % sizeX] != 1 && gateAt((point.x + 1) % sizeX, point.y) == false) {
			queue.push({
				x: (point.x + 1) % sizeX,
				y: point.y,
				dir: 0,
				dist: (pacmanX - ((point.x + 1) % sizeX)) * (pacmanX - ((point.x + 1) % sizeX)) + (pacmanY - point.y) * (pacmanY - point.y)
			})
		}
		if(map[(point.y - 1 + sizeY) % sizeY][point.x] != 1 && gateAt(point.x, (point.y - 1 + sizeY) % sizeY) == false) {
			queue.push({
				x: point.x,
				y: (point.y - 1 + sizeY) % sizeY,
				dir: 1,
				dist: (pacmanX - point.x) * (pacmanX - point.x) + (pacmanY - ((point.y - 1 + sizeY) % sizeY)) * (pacmanY - ((point.y - 1 + sizeY) % sizeY))
			})
		}
		if(map[point.y][(point.x - 1 + sizeX) % sizeX] != 1 && gateAt((point.x - 1 + sizeX) % sizeX, point.y) == false) {
			queue.push({
				x: (point.x - 1 + sizeX) % sizeX,
				y: point.y,
				dir: 2,
				dist: (pacmanX - ((point.x - 1 + sizeX) % sizeX)) * (pacmanX - ((point.x - 1 + sizeX) % sizeX)) + (pacmanY - point.y) * (pacmanY - point.y)
			})
		}
		if(map[(point.y + 1) % sizeY][point.x] != 1 && gateAt(point.x, (point.y + 1) % sizeY) == false) {
			queue.push({
				x: point.x,
				y: (point.y + 1) % sizeY,
				dir: 3,
				dist: (pacmanX - point.x) * (pacmanX - point.x) + (pacmanY - ((point.y + 1) % sizeY)) * (pacmanY - ((point.y + 1) % sizeY))
			})
		}
	}
	return queue
}

function moveBlinky(ghost, amount) {
	if(ghost.subX == 0 && ghost.subY == 0) {
		ghost.direction = doBFS(ghost, {
			x: pacmanX,
			y: pacmanY,
			dir: ghost.direction
		})
	}
	moveGhost(ghost, amount)
}

function movePinky(ghost, amount) {
	if(ghost.subX == 0 && ghost.subY == 0) {
		var queue = searchAdjacent(ghost)
		if(queue.length > 0) {
			point = queue[0]
			for(var i = 1; i < queue.length; i++) {
				if(queue[i].dist < point.dist) {
					point = queue[i]
				}
			}
			ghost.direction = point.dir
		}
	}
	moveGhost(ghost, amount)
}

function moveInky(ghost, amount) {
	if(ghost.subX == 0 && ghost.subY == 0) {
		var queue = searchAdjacent(ghost)
		if(queue.length > 0) {
			point = queue[0]
			if(Math.random() < 0.4) {
				for(var i = 1; i < queue.length; i++) {
					if(queue[i].dist < point.dist) {
						point = queue[i]
					}
				}
			} else {
				point = queue[Math.floor(Math.random() * queue.length)]
			} 
			ghost.direction = point.dir
		}
	}
	moveGhost(ghost, amount)
}

function moveClyde(ghost, amount) {
	if(ghost.subX == 0 && ghost.subY == 0) {
		var queue = searchAdjacent(ghost)
		if(queue.length > 0) {
			point = queue[Math.floor(Math.random() * queue.length)]
			ghost.direction = point.dir
		}
	}
	moveGhost(ghost, amount)
}

function moveGhost(ghost, amount) {
	if(ghost.leavingGate == true) {
		ghost.leavingGate = false
		ghost.direction = ghost.leavingDirection
	}
	if(ghost.edible == true && ghost.dead == false) {
		//amount /= 2
	}
	if(ghost.subX == 0 && ghost.subY == 0) {
		if(ghost.dead == true) {
			ghost.direction = doBFS(ghost, {
				x: ghost.spawnX,
				y: ghost.spawnY,
				dir: ghost.direction
			})
		} else if(ghost.gating == true) {
			var nearestGate = gates[0]
			for(var i = 1; i < gates.length; i++) {
				var newDist = (ghost.x - gates[i].x) * (ghost.x - gates[i].x) + (ghost.y - gates[i].y) * (ghost.y - gates[i].y)
				var oldDist = (ghost.x - nearestGate.x) * (ghost.x - nearestGate.x) + (ghost.y - nearestGate.y) * (ghost.y - nearestGate.y)
				if(newDist < oldDist) {
					nearestGate = gates[i]
				}
			}
			ghost.direction = doBFS(ghost, {
				x: nearestGate.x,
				y: nearestGate.y,
				dir: ghost.direction
			})
			ghost.leavingDirection = ghost.direction
		}
		var wallLeft = ghost.direction == 0 && map[ghost.y][(ghost.x + 1) % sizeX] == 1
		var wallUp = ghost.direction == 1 && map[(ghost.y - 1 + sizeY) % sizeY][ghost.x] == 1
		var wallRight = ghost.direction == 2 && map[ghost.y][(ghost.x - 1 + sizeX) % sizeX] == 1
		var wallDown = ghost.direction == 3 && map[(ghost.y + 1) % sizeY][ghost.x] == 1
		if(wallLeft || wallUp || wallRight || wallDown) {
			return
		}
		if(ghost.direction == 0) {
			ghost.subX += amount
		} else if (ghost.direction == 1) {
			ghost.subY -= amount
		} else if (ghost.direction == 2) {
			ghost.subX -= amount
		} else {
			ghost.subY += amount
		}
	} else if (ghost.subX == tileSize) {
		ghost.subX = 0
		ghost.x++
	} else if (ghost.subY == tileSize) {
		ghost.subY = 0
		ghost.y++
	} else if (ghost.subX == -tileSize) {
		ghost.subX = 0
		ghost.x--
	} else if (ghost.subY == -tileSize) {
		ghost.subY = 0
		ghost.y--
	} else {
		if(ghost.direction == 0) {
			ghost.subX += amount
		} else if (ghost.direction == 1) {
			ghost.subY -= amount
		} else if (ghost.direction == 2) {
			ghost.subX -= amount
		} else {
			ghost.subY += amount
		}
	}
	if(ghost.x == sizeX) {
		ghost.x = 0
	}
	if(ghost.y == sizeY) {
		ghost.y = 0
	}
	if(ghost.x == -1) {
		ghost.x = sizeX - 1
	}
	if(ghost.y == -1) {
		ghost.y = sizeY - 1
	}
}

function game() {
	if(loading > 0) {
		loading--
	} else if (deathAnimation > 0) {
		deathAnimation--
		mouthStretch += 0.03
		if(deathAnimation == 0) {
			lives--
			if(lives >= 0) {
				pacmanX = spawnX
				pacmanY = spawnY
				pacmanSubX = 0
				pacmanSubY = 0
				pacmanDirection = 0
				pacmanNextDirection = 0
				mouthStretch = 0
				for(var i = 0; i < 4; i++) {
					ghosts[i].x = ghosts[i].spawnX
					ghosts[i].y = ghosts[i].spawnY
					ghosts[i].subX = 0
					ghosts[i].subY = 0
				}
			} else {
				labels.push({
					text: "GAME OVER",
					life: 100,
					x: fruitX,
					y: fruitY
				})
				clearInterval(gameInterval)
			}
			loading = 200
		}
	} else {
		movePacman(pacmanDirection, 1.5)
		moveBlinky(ghosts[0], 1.5)
		movePinky(ghosts[1], 1.5)
		moveInky(ghosts[2], 1.5)
		moveClyde(ghosts[3], 1.5)
		if(Math.random() < 0.001 && currentFruit < Math.min(8, level)) {
			fruit[currentFruit].edible = true
		}
		if(fruit[currentFruit].edible == true) {
			fruit[currentFruit].timeout--
			if(fruit[currentFruit].timeout == 0) {
				fruit[currentFruit].edible = false
				currentFruit++
			}
		}
		for(var i = 0; i < labels.length; i++) {
			labels[i].life--
			if(labels[i].life <= 0) {
				labels.splice(i, 1)
			}
		}
		if(map[pacmanY][pacmanX] == 2) {
			score += 10
			modScore += 10
			map[pacmanY][pacmanX] = 0
		} else if(map[pacmanY][pacmanX] == 3) {
			score += 50
			modScore += 50
			map[pacmanY][pacmanX] = 0
			eating = 500
			eatScore = 200
			for(var i = 0; i < 4; i++) {
				if(ghosts[i].dead == false) {
					ghosts[i].edible = true
					ghosts[i].colour = "blue"
				}
			}
		}
		for(var i = 0; i < fruit.length; i++) {
			if(pacmanX == fruitX && pacmanY == fruitY && fruit[i].edible == true) {
				score += fruit[i].score
				modScore += fruit[i].score
				fruit[i].edible = false
				currentFruit++
				labels.push({
					text: fruit[i].score.toString(),
					life: 100,
					x: fruitX,
					y: fruitY
				})
			}
		}
		for(var i = 0; i < 4; i++) {
			var x1 = pacmanX * tileSize + pacmanSubX < (ghosts[i].x + 1) * tileSize + ghosts[i].subX
			var x2 = (pacmanX + 1) * tileSize + pacmanSubX > ghosts[i].x * tileSize + ghosts[i].subX
			var y1 = pacmanY * tileSize + pacmanSubY < (ghosts[i].y + 1) * tileSize + ghosts[i].subY
			var y2 = (pacmanY + 1) * tileSize + pacmanSubY > ghosts[i].y * tileSize + ghosts[i].subY
			if(x1 && x2 && y1 && y2) {
				if(ghosts[i].dead == false && ghosts[i].edible == false) {
					mouthStretch = 0
					deathAnimation = 90
				} else if(ghosts[i].edible == true && ghosts[i].dead == false) {
					ghosts[i].dead = true;
					score += eatScore
					modScore += eatScore
					labels.push({
						text: eatScore.toString(),
						life: 100,
						x: ghosts[i].x,
						y: ghosts[i].y
					})
					eatScore *= 2
					ghosts[i].colour = "white"
				}
			}
			if(ghosts[i].x == ghosts[i].spawnX && ghosts[i].y == ghosts[i].spawnY) {
				if(ghosts[i].dead == true) {
					ghosts[i].dead = false
					ghosts[i].edible = false
					ghosts[i].colour = colours[i]
				}
				ghosts[i].gating = true
			}
			if(gateAt(ghosts[i].x, ghosts[i].y) == true && ghosts[i].dead == false) {
				ghosts[i].gating = false
				ghosts[i].leavingGate = true
			}
		}
		if(pacmanSubX == 0 && pacmanSubY == 0) {
			var canLeft = (pacmanNextDirection == 0 && map[pacmanY][(pacmanX + 1) % sizeX] != 1)
			var canUp = (pacmanNextDirection == 1 && map[(pacmanY - 1 + sizeY) % sizeY][pacmanX] != 1)
			var canRight = (pacmanNextDirection == 2 && map[pacmanY][(pacmanX - 1 + sizeX) % sizeX] != 1)
			var canDown = (pacmanNextDirection == 3 && map[(pacmanY + 1) % sizeY][pacmanX] != 1)
			if(canLeft || canUp || canRight || canDown) {
				pacmanDirection = pacmanNextDirection
			}
		}
		if(dots == 0) {
			level++
			pacmanSubX = 0
			pacmanSubY = 0
			pacmanDirection = 0
			pacmanNextDirection = 0
			for(var i = 0; i < 4; i++) {
				ghosts[i].subX = 0
				ghosts[i].subY = 0
				ghosts[i].edible = false
				ghosts[i].dead = false
			}
			for(var i = 0; i < Math.min(8, level); i++) {
				fruit[i].available = true;
				fruit[i].edible = false;
				fruit[i].timeout = 1000;
			}
			currentFruit = 0
			decode(mapString)
			loading = 200
			eating = 0
		}
		if(modScore >= 10000) {
			modScore -= 10000
			lives++
		}
		eating--
		if(eating <= 0) {
			for(var i = 0; i < 4; i++) {
				ghosts[i].edible = false;
				if(ghosts[i].dead == false) {
					ghosts[i].colour = colours[i]
				}
			}
			eating = 0
		}
	}
}

function draw() {
	canvas.fillStyle = "black"
	canvas.fillRect(0, 0, tileSize * sizeX, tileSize * (sizeY + 2))
	var mapDots = 0
	for(var y = 0; y < sizeY; y++) {
		for(var x = 0; x < sizeX; x++) {
			var tile = map[y][x]
			switch(tile) {
				case 1: //wall
					canvas.fillStyle = "blue"
					canvas.fillRect(tileSize * x, tileSize * (y + 1), tileSize, tileSize)
					break
				case 2: //dot
					canvas.fillStyle = "white"
					canvas.beginPath()
					canvas.arc(tileSize * (x + 0.5), tileSize * (y + 1.5), dotRadius, 0, Math.PI * 2, true)
					canvas.fill()
					mapDots++
					break
				case 3: //megadot
					canvas.fillStyle = "white"
					canvas.beginPath()
					canvas.arc(tileSize * (x + 0.5), tileSize * (y + 1.5), megadotRadius, 0, Math.PI * 2, true)
					canvas.fill()
					mapDots++
					break;
			}
		}
	}
	for(var i = 0; i < gates.length; i++) {
		canvas.fillStyle = "brown"
		canvas.fillRect(gates[i].x * tileSize, (gates[i].y + 1) * tileSize, tileSize, tileSize)
	}
	for(var i = 0; i < fruit.length; i++) {
		if(fruit[i].edible == true) {
			canvas.fillStyle = "green"
			canvas.fillRect(fruitX * tileSize, (fruitY + 1) * tileSize, tileSize, tileSize)
		}
	}
	for(var i = 0; i < 4; i++) {
		if(ghosts[i].colour == "blue" && eating < 200 && Math.floor(eating / 20) % 2 == 0) {
			canvas.fillStyle = "white"
		} else {
			canvas.fillStyle = ghosts[i].colour
		}
		if(ghosts[i].dead == false) {
			canvas.beginPath()
			canvas.arc(tileSize * (ghosts[i].x + 0.5) + ghosts[i].subX, tileSize * (ghosts[i].y + 1.5) + ghosts[i].subY, tileSize / 2, 0, Math.PI, true)
			for(var j = 0; j < 3; j++) {
				canvas.lineTo(tileSize * (ghosts[i].x + j/3) + ghosts[i].subX, tileSize * (ghosts[i].y + 2) + ghosts[i].subY)
				canvas.lineTo(tileSize * (ghosts[i].x + j/3 + 1/6) + ghosts[i].subX, tileSize * (ghosts[i].y + 1.8) + ghosts[i].subY)
			}
			canvas.lineTo(tileSize * (ghosts[i].x + 1) + ghosts[i].subX, tileSize * (ghosts[i].y + 2) + ghosts[i].subY)
			canvas.fill()
		}
		canvas.fillStyle = "white"
		canvas.beginPath()
		canvas.ellipse(tileSize * (ghosts[i].x + 0.3) + ghosts[i].subX, tileSize * (ghosts[i].y + 1.3) + ghosts[i].subY, tileSize / 7, tileSize / 5, 0, 0, 2 * Math.PI, true)
		canvas.ellipse(tileSize * (ghosts[i].x + 0.7) + ghosts[i].subX, tileSize * (ghosts[i].y + 1.3) + ghosts[i].subY, tileSize / 7, tileSize / 5, 0, 0, 2 * Math.PI, true)
		canvas.fill()
		canvas.fillStyle = "black"
		var eyePos = [0.1, 0.0, -0.1, 0.0]
		canvas.beginPath()
		canvas.arc(tileSize * (ghosts[i].x + 0.3 + eyePos[ghosts[i].direction]) + ghosts[i].subX, tileSize * (ghosts[i].y + 1.3 + eyePos[(ghosts[i].direction + 1) % 4]) + ghosts[i].subY, tileSize / 9, 0, 2 * Math.PI, true)
		canvas.arc(tileSize * (ghosts[i].x + 0.7 + eyePos[ghosts[i].direction]) + ghosts[i].subX, tileSize * (ghosts[i].y + 1.3 + eyePos[(ghosts[i].direction + 1) % 4]) + ghosts[i].subY, tileSize / 9, 0, 2 * Math.PI, true)
		canvas.fill()
	}
	dots = mapDots
	canvas.fillStyle = "yellow"
	canvas.beginPath()
	canvas.arc(tileSize * (pacmanX + 0.5) + pacmanSubX, tileSize * (pacmanY + 1.5) + pacmanSubY, tileSize / 2, (Math.PI / 7 + mouthStretch) - pacmanDirection * Math.PI / 2, -(Math.PI / 7 + mouthStretch) - pacmanDirection * Math.PI / 2, false)
	var mouthEnd = [0.3, 0.5, 0.7, 0.5]
	canvas.lineTo(tileSize * (pacmanX + mouthEnd[pacmanDirection]) + pacmanSubX, tileSize * (pacmanY + 1 + mouthEnd[(pacmanDirection + 1) % 4]) + pacmanSubY)
	canvas.fill()
	canvas.fillStyle = "black"
	canvas.fillRect(0, 0, tileSize * sizeX, tileSize)
	canvas.fillRect(0, tileSize * (sizeY + 1), tileSize * sizeX, tileSize)
	canvas.fillStyle = "white"
	canvas.textAlign = "start";
	canvas.font = "16px sans-serif"
	canvas.fillText(score, 4, tileSize * 0.9)
	for(var i = 0; i < lives; i++) {
		canvas.fillStyle = "yellow"
		canvas.beginPath()
		canvas.arc(tileSize * (1.2 * i + 0.5), tileSize * (sizeY + 1.5), tileSize / 2, Math.PI / 7, -Math.PI / 7, false)
		var mouthEnd = [0.3, 0.5, 0.7, 0.5]
		canvas.lineTo(tileSize * (1.2 * i + 0.3), tileSize * (sizeY + 1.5))
		canvas.fill()
	}
	for(var i = 0; i < fruit.length; i++) {
		if(fruit[i].available == true) {
			canvas.fillStyle = "green"
			canvas.fillRect(tileSize * (sizeX - 1.2 * i - 1), tileSize * (sizeY + 1), tileSize, tileSize)
		}
	}
	canvas.fillStyle = "white"
	canvas.textAlign = "center";
	canvas.font = "10px sans-serif"
	for(var i = 0; i < labels.length; i++) {
		canvas.fillText(labels[i].text, (labels[i].x + 0.5) * tileSize, (labels[i].y + 1.75) * tileSize)
	}
	requestAnimationFrame(draw)
}