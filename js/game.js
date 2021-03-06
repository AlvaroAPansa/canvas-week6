/*jslint bitwise:true, es5: true */
(function (window, undefined) {
    'use strict';
    var KEY_ENTER = 13,
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40,
        canvas = undefined,
        ctx = undefined,
        lastPress = undefined,
        pause = true,
        gameover = true,
        fullscreen = false,
        dir = 0,
        score = 0,
        //wall = [],
        body = [],
        food = undefined,
        bonus = undefined,
        iBody = new Image(),
        iFood = new Image(),
        iBonus = new Image(),
        aEat = new Audio(),
        aDie = new Audio(),
        //FPS variables
        lastUpdate = 0,
        FPS = 0,
        frames = 0,
        acumDelta = 0,
        //Buffer variables
        buffer = undefined,
        bufferCtx = undefined,
        bufferScale = 1,
        bufferOffsetX = 0,
        bufferOffsetY = 0,
        // Scenes variables
        scenes = [],
        currentScene = 0,
        mainScene = undefined,
        gameScene = undefined,
        // High Scores variables
        highscores = [],
        posHighscore = 10,
        highscoresScene = undefined,
        // Challenge variables
        fruitCount = 0,// To count the amount of regular fruit eaten since the last bonus
        bonusTrigger = false,// To define if the bonus fruit should be triggered or not
        countTrigger = undefined,// To define the fuits since which the bonus fruit will be triggered
        firstRequest = true,
        scoreUrl = 'www.jsonplaceholder.com';// The strig of the URL where we will be adding the score on teh queryparams

    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 17);
        };
    }());

    document.addEventListener('keydown', function (evt) {
        if (evt.which >= 37 && evt.which <= 40) {
            evt.preventDefault();
        }
        lastPress = evt.which;
    }, false);

    function defineTrigger() { // -- Challenge function -- Random integer between 8 and 12
        return Math.floor(Math.random() * (12 - 8 + 1) + 8);
    }

    function sendScore (url) {
        const promise = new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.onreadystatechange = function (e) {
                if(request.readyState === 4) {
                    if(request.status >= 200 && request.status < 400) {
                        let reply = request.responseText;
                        resolve(reply);
                    } else {
                        reject('Error trying to send the score')
                    }
                }
            };
            request.send();
        });
        return promise;
    }

    function Rectangle(x, y, width, height) {
        this.x = (x === undefined) ? 0 : x;
        this.y = (y === undefined) ? 0 : y;
        this.width = (width === undefined) ? 0 : width;
        this.height = (height === undefined) ? this.width : height;
    }
    
    Rectangle.prototype.intersects = function (rect) {
        if (rect === undefined) {
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
            }
    };

    Rectangle.prototype.fill = function (ctx) {
        if (ctx === undefined) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    Rectangle.prototype.drawImage = function (ctx, img) {
        if (img === undefined) {
            window.console.warn('Missing parameters on function drawImage');
        } else {
            if (img.width) {
                ctx.drawImage(img, this.x, this.y);
            } else {
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }
    };

    function Scene() {
        this.id = scenes.length;
        scenes.push(this);
    }

    Scene.prototype.load = function () {
    }

    Scene.prototype.paint = function (ctx) {
    }

    Scene.prototype.act = function () {
    }

    function loadScene(scene) {
        currentScene = scene.id;
        scenes[currentScene].load();
    }
    
    function random(max) {
        return ~~(Math.random() * max);
    }

    function addHighscore(score) {
        posHighscore = 0;
        while (highscores[posHighscore] > score && posHighscore < highscores.length) {
            posHighscore += 1;
        }
        highscores.splice(posHighscore, 0, score);
        if (highscores.length > 10) {
            highscores.length = 10;
        }
        localStorage.highscores = highscores.join(',');// Convert the array to text, because local storage can't store arrays
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        var w = window.innerWidth / buffer.width;
        var h = window.innerHeight / buffer.height;
        bufferScale = Math.min(h, w);

        bufferOffsetX = (canvas.width - (buffer.width * bufferScale)) / 2;
        bufferOffsetY = (canvas.height - (buffer.height * bufferScale)) / 2;
    }

    function canPlayOgg() {
        var aud = new Audio();
        if (aud.canPlayType('audio/ogg').replace(/no/, '')) {
            return true;
        } else {
            return false;
        }
    }

    function repaint() {
        window.requestAnimationFrame(repaint);
        //FPS Code
        var now = Date.now(),
            deltaTime = (now - lastUpdate) / 1000;
        if (deltaTime > 1) {
            deltaTime = 0;
        }
        lastUpdate = now;
        frames += 1;
        acumDelta += deltaTime;
        if (acumDelta > 1) {
            FPS = frames;
            frames = 0;
            acumDelta -= 1;
        }
        //FPS Code end
        if (scenes.length) {
            scenes[currentScene].paint(bufferCtx);
        }
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(buffer, bufferOffsetX, bufferOffsetY, buffer.width * bufferScale, buffer.height * bufferScale);
    }

    function run() {
        setTimeout(run, 50);
        if (scenes.length) {
            scenes[currentScene].act();
        }
    }

    function init() {
        // Get canvas and context
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 300;
        // Load buffer
        buffer = document.createElement('canvas');
        bufferCtx = buffer.getContext('2d');
        buffer.width = 300;
        buffer.height = 150;
        // Load assets
        iBody.src = 'assets/body.png';
        iFood.src = 'assets/fruit.png';
        iBonus.src = 'assets/bonus.png';// -- Challenge Line -- Loads bonus image
        if (canPlayOgg()) {
            aEat.src = 'assets/chomp.oga';
            aDie.src = 'assets/dies.oga';
        } else {
            aEat.src = 'assets/chomp.m4a';
            aDie.src = 'assets/dies.m4a';
        };
        // Create food and bonus
        food = new Rectangle(80, 80, 10, 10);
        bonus = new Rectangle(80, 80, 10, 10);// -- Challenge Line -- Creates bonus object (Rectagle type)
        countTrigger = defineTrigger();// -- Challenge Line -- Defines randomly (between 8 and 12) the fruit count that will trigger the bonus
        // Create walls
        /*wall.push(new Rectangle(100, 50, 10, 10));
        wall.push(new Rectangle(100, 100, 10, 10));
        wall.push(new Rectangle(200, 50, 10, 10));
        wall.push(new Rectangle(200, 100, 10, 10));*/
        //Load saved highscores
        if (localStorage.highscores) {
            highscores = localStorage.highscores.split(',');
        }
        // Start game
        resize();
        run();
        repaint();
    }

    // Main scene
    mainScene = new Scene();

    mainScene.paint = function(ctx) {
        // Clean canvas
        ctx.fillStyle = '#030';
        ctx.fillRect(0, 0, buffer.width, buffer.height);
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('SNAKE', 150, 60);
        ctx.fillText('Press Enter', 150, 90);
    }

    mainScene.act = function() {
        // Load next scene
        if (lastPress === KEY_ENTER) {
            loadScene(highscoresScene);
            lastPress = undefined;
        }
    }

    // Game scene
    gameScene = new Scene();

    gameScene.load = function() {
        score = 0;
        dir = 1;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        food.x = random(buffer.width / 10 - 1) * 10;
        food.y = random(buffer.height / 10 - 1) * 10;
        bonus.x = random(buffer.width / 10 - 1) * 10;
        bonus.y = random(buffer.height / 10 - 1) * 10;
        gameover = false;
    }

    gameScene.paint = function(ctx) {
        var i = 0,
            l = 0;
        // Clean canvas
        ctx.fillStyle = '#030';
        ctx.fillRect(0, 0, buffer.width, buffer.height);
        // Draw player
        ctx.strokeStyle = '#0f0';
        for (i = 0, l = body.length; i < l; i++) {
            body[i].drawImage(ctx, iBody);
        }
        // Draw walls
        /*ctx.fillStyle = '#999';
        for(i = 0 ,l = wall.length; i < l; i += 1) {
            wall[i].fill(ctx);
        }*/
        // Draw food
        ctx.strokeStyle = '#f00';
        food.drawImage(ctx, iFood);
        // -- Challenge section -- Draw bonus
        if (bonusTrigger === true) {
            ctx.fillStyle = '#F0F';
            bonus.drawImage(ctx, iBonus);
        }
        // Draw score
        ctx.fillStyle = '#fff';
        ctx.fillText('Score: ' + score, 0, 10);
        // Draw pause
        if (pause) {
            ctx.textAlign = 'center';
            if (gameover) {
                ctx.fillText('GAME OVER', 150, 75);
            } else {
                ctx.fillText('PAUSE', 150, 75);
            }
            ctx.textAlign = 'left';
        }
        // Draw FPS
        ctx.fillText('FPS: ' + FPS, 10, 20);
    }

    gameScene.act = function () {
        var i = 0,
            l = 0;
        if (!pause) {
            // GameOver Reset
            if (gameover) {
                loadScene(highscoresScene);
                fruitCount = 0;// -- Challenge line -- Resets the count to bonus in game over
                bonusTrigger = false;// -- Challenge line -- Resets the trigger of the bonus in game over
            }
            // Move Body
            for (i = body.length - 1; i > 0; i -= 1) {
                body[i].x = body[i - 1].x;
                body[i].y = body[i - 1].y;
            }
            // Change Direction
            if (lastPress === KEY_UP && dir !== 2) {
                dir = 0;
            }
            if (lastPress === KEY_RIGHT && dir !== 3) {
                dir = 1;
            }
            if (lastPress === KEY_DOWN && dir !== 0) {
                dir = 2;
            }
            if (lastPress === KEY_LEFT && dir !== 1) {
                dir = 3;
            }
            // Move Head
            if (dir === 0) {
                body[0].y -= 10;
            }
            if (dir === 1) {
                body[0].x += 10;
            }
            if (dir === 2) {
                body[0].y += 10;
            }
            if (dir === 3) {
                body[0].x -= 10;
            }
            // Out Screen
            if (body[0].x > buffer.width - body[0].width) {
                body[0].x = 0;
            }
            if (body[0].y > buffer.height - body[0].height) {
                body[0].y = 0;
            }
            if (body[0].x < 0) {
                body[0].x = buffer.width - body[0].width;
            }
            if (body[0].y < 0) {
                body[0].y = buffer.height - body[0].height;
            }
            // Wall Intersects
            /*for(i = 0, l = wall.length; i < l; i += 1){
                if (food.intersects(wall[i])) {
                    food.x = random(buffer.width / 10 - 1) * 10;
                    food.y = random(buffer.height / 10 - 1) * 10;
                }
                if(body[0].intersects(wall[i])){
                    gameover = true;
                    pause = true;
                }
            }*/
            // Body Intersects
            for (i = 2, l = body.length; i < l; i++) {
                if (body[0].intersects(body[i])) {
                    gameover = true;
                    pause = true;
                    aDie.play();
                    addHighscore(score);
                }
            }
            // Food Intersects
            if (body[0].intersects(food)) {
                body.push(new Rectangle(0, 0, 10, 10));
                score += 1;
                food.x = random(buffer.width / 10 - 1) * 10;
                food.y = random(buffer.height / 10 - 1) * 10;
                aEat.play();
                fruitCount += 1;// -- Challenge line --
                if (fruitCount === countTrigger) { // -- Challenge line -- Conditional to trigger the bonus fruit if count==trigger
                    bonusTrigger = true;
                }
            }
            // Bonus Intersects -- Challenge section --
            if (body[0].intersects(bonus) && bonusTrigger === true) {
                score += 5;
                bonus.x = random(buffer.width / 10 - 1) * 10;
                bonus.y = random(buffer.height / 10 - 1) * 10;
                aEat.play();
                fruitCount = 0;// Resets the count that will trigger the bonus
                countTrigger = defineTrigger();// Defines a new point to trigger the bonus
                bonusTrigger = false;//Eliminates sections that paint and intersect the bonus
                if (firstRequest) {// Adds the query params to the URL
                    scoreUrl += '?score=' + score;
                    firstRequest = false;
                    console.log(scoreUrl);
                } else {
                    scoreUrl += '&score=' + score;
                    console.log(scoreUrl);
                }
                sendScore(scoreUrl)
                .then(
                    (reply) => {
                        console.log('Score sent successfully')
                    }
                )
                .catch(
                    (error) => {
                        console.log(error);
                    }
                )
            }
        }
        // Pause/Unpause
        if (lastPress === KEY_ENTER) {
            pause = !pause;
            lastPress = undefined;
        }        
    }

    // Highscore scene
    highscoresScene = new Scene();

    highscoresScene.paint = function (ctx) {
        var i = 0,
            l = 0;
        // Clean canvas
        ctx.fillStyle = '#030';
        ctx.fillRect(0, 0, buffer.width, buffer.height);
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('HIGH SCORES', 150, 30);
        // Draw high scores
        ctx.textAlign = 'right';
        for (i = 0, l = highscores.length; i < l; i++) {
            if (i === posHighscore) {
                ctx.fillText('*' + highscores[i], 180, 40 + i * 10);
            } else {
                ctx.fillText(highscores[i], 180, 40 + i * 10);
            }
        }
    }

    highscoresScene.act = function () {
        // Load next scene
        if (lastPress === KEY_ENTER) {
            loadScene(gameScene);
            lastPress = undefined;
        }
    }

    window.addEventListener('load', init, false);
    window.addEventListener('resize', resize, false);
}(window));