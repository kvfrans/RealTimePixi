
var socket = io.connect('http://murmuring-peak-8496.herokuapp.com/:5000');
// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x3498db,true);

// create a renderer instance
var renderer = new PIXI.autoDetectRenderer(1000, 600);

// add the renderer view element to the DOM
document.getElementById("gameView").appendChild(renderer.view);


var keysDown = {
    left: false,
    right: false,
    up: false,
    down: false
};


var clientnumber = -1;
var room = -1;

socket.emit("firstConnect",{message: "chicken"});

// create a texture from an image path
var texture = PIXI.Texture.fromImage("player.png");
var shot = PIXI.Texture.fromImage("shot.png");
var circletexture = PIXI.Texture.fromImage("circle.png");
// create a new Sprite using the texture

var bunnies = [];
var playerdirection = "left";

var bullet;
var bulletorigin;
var bulletdirection;

var hasLoaded = false;



var loadedItself = false;




var shield;
var shieldscale;
var shieldalpha;

var enemyshield;
var enemyshieldscale;
var enemyshieldalpha;

var enemybullet;
var enemybulletup = false;
var enemybulletorigin;
var enemybulletdirection;

var dashingvalue = 0;



var dashCD = 50;
var shieldCD = 200;
var shootCD = 19;

var openingAnimationCounter = 1000;

var stripes = [];

var stripetexture = new PIXI.Texture.fromImage("stripe.png");


for(var i = 0; i < 10; i++)
{
	stripes[i] = new PIXI.Sprite(stripetexture);
	stripes[i].anchor.x = 1;
	stripes[i].anchor.y = 0.5;
	stripes[i].position.y = 300;
	stripes[i].position.x = 200 * i;
	stage.addChild(stripes[i]);
}

//cooldown text stuff
var dashCDLabel = new PIXI.Text("attack", {font:"15px HelveticaNeue-UltraLight", fill:"white"});
dashCDLabel.position.x = 15+100+15;
dashCDLabel.position.y = 12;
stage.addChild(dashCDLabel);

var shieldCDLabel = new PIXI.Text("shield", {font:"15px HelveticaNeue-UltraLight", fill:"white"});
shieldCDLabel.position.x = 15+100+15;
shieldCDLabel.position.y = 12 + 40;
stage.addChild(shieldCDLabel);

var shootCDLabel = new PIXI.Text("dash", {font:"15px HelveticaNeue-UltraLight", fill:"white"});
shootCDLabel.position.x = 15+100+15;
shootCDLabel.position.y = 12 + 20;
stage.addChild(shootCDLabel);

var dashCooldown = new PIXI.Graphics();
stage.addChild(dashCooldown);








var winning = false;
var lost;
var realwinning = false;
var realwinOpacity;

var homebutton;
var homebuttonbg;
var reloadbutton;
var reloadbuttonbg;

var homebuttonsize = 0.8;
var reloadbuttonsize = 0.8;

var congratsText;

var twistFilter = new PIXI.TwistFilter();

stage.filters = [twistFilter];
twistFilter.angle = 0.001;
twistFilter.radius = 0;

var twistangle = 0.01;

var screenFlashOpacity = 0;
var deathexplosion;



var trails = [];







//SOCKET CALLBACKS
socket.on('imConnected', function (data)
{


    if(clientnumber == -1)
    {
        clientnumber = data.clientnumber;
        //console.log(clientnumber);

        if(data.clientnumber > 1)
        {
            window.location.replace('sorry.html');
        }

        for(var i = 0; i < clientnumber+1;i++)
        {
            bunnies[i] = new PIXI.Sprite(texture);
            // center the sprites anchor point
            bunnies[i].anchor.x = 0.5;
            bunnies[i].anchor.y = 0.5;
            // move the sprite t the center of the screen
            bunnies[i].position.x = 200;
            bunnies[i].position.y = 150;
            stage.addChild(bunnies[i]);
            var text = new PIXI.Text((i+1).toString(), {font:"20px HelveticaNeue-UltraLight", fill:"white"});
            text.position.x = 0;
            text.position.y = 0;
            //bunnies[i].addChild(text);
        }
        requestAnimFrame( animate );

        if(data.clientnumber == 1)
        {
            hasLoaded = true;
        }
            console.log("loaded in room " + data.room.toString() + " with client #" + data.clientnumber.toString());
            room = data.room;

            loadedItself = true;


    }
    else
    {
        if(data.room == room)
    {
        if(data.clientnumber < 2)
        {
            hasLoaded = true;
            bunnies[data.clientnumber] = new PIXI.Sprite(texture);
            // center the sprites anchor point
            bunnies[data.clientnumber].anchor.x = 0.5;
            bunnies[data.clientnumber].anchor.y = 0.5;
            // move the sprite t the center of the screen
            bunnies[data.clientnumber].position.x = 200;
            bunnies[data.clientnumber].position.y = 150;
            stage.addChild(bunnies[data.clientnumber]);
            var text = new PIXI.Text("Bunny " + (i+1).toString(), {font:"20px Helvetica", fill:"white"});
            text.position.x = 0;
            text.position.y = 0;
            //bunnies[i].addChild(text);

            console.log("loaded other guy.");
        }

    }

    }
});

socket.on('someoneMoved', function (data)
{
    if(data.room == room)
    {
    //console.log("m1");
    if(hasLoaded)
    {
        //console.log("move");
        //console.log(data.clientnumber);
        bunnies[data.clientnumber].position.x = data.x;
        bunnies[data.clientnumber].position.y = data.y;

        if(enemyshield)
        {
            enemyshield.position.x = data.x;
            enemyshield.position.y = data.y;
        }
        //console.log("move");
    }
}

});

socket.on('someoneMovedBullet', function (data)
{
    if(data.room == room)
    {
    if(data.clientnumber != clientnumber)
    {
        if(enemybullet)
        {
            enemybullet.position.x = data.x;
            enemybullet.position.y = data.y;
        }
        else
        {
            enemybulletup = true;
            enemybullet = new PIXI.Sprite(shot);
            //bullet.scale = 0.5;
            enemybullet.anchor.x = 0.5;
            enemybullet.anchor.y = 0.5;
            enemybullet.position.x = data.x;
            enemybullet.position.y = data.y;
            stage.addChild(enemybullet);
            enemybulletorigin = enemybullet.position;

        }
    }
}

});


socket.on('someoneDestroyedBullet', function (data)
{
    if(data.room == room)
    {
    if(data.clientnumber != clientnumber)
    {
        enemybulletup = false;
        stage.removeChild(enemybullet);
        enemybullet = null;
    }
}

});

socket.on('someoneBlocked', function (data)
{
    if(data.room == room)
    {
    if(data.clientnumber != clientnumber)
    {
        //enemybulletup = false;
        stage.removeChild(bullet);
        bullet = null;
    }
}

});



socket.on('someoneShielded', function (data)
{
    if(data.room == room)
    {
    if(data.clientnumber != clientnumber)
    {
        enemyshield = new PIXI.Sprite(circletexture);
        enemyshield.anchor.x = 0.5;
        enemyshield.anchor.y = 0.5;
        enemyshield.position.x = bunnies[data.clientnumber].position.x;
        enemyshield.position.y = bunnies[data.clientnumber].position.y;
        stage.addChild(enemyshield);
        enemyshieldscale = 0.01;
        enemyshieldalpha = 1;
        enemyshield.scale = new PIXI.Point(0,0);
    }
}

});


socket.on('gg', function (data)
{
    if(data.room == room)
    {
    if(data.loser != clientnumber)
    {
        win();
    }
    else
    {
        lost = true;
        win();
    }
}
});

socket.on('dc', function (data)
{
    //win();
});

function win()
{

	if(winning == false)
	{
		var x;
		if(clientnumber == 0)
		{
			x = 1;
		}
		else
		{
			x = 0;
		}
		 winning = true;
		screenFlashOpacity = 1;

		if(lost == true)
		{
			x = clientnumber;
		}

		deathexplosion = new PIXI.Sprite(shot);
		deathexplosion.anchor.x = 0.5;
		deathexplosion.anchor.y = 0.5;
		deathexplosion.position.x = bunnies[x].position.x;
		deathexplosion.position.y = bunnies[x].position.y;
		stage.addChild(deathexplosion);

		stage.removeChild(bunnies[x]);

	}

}





function realWin()
{
    if(realwinning == false)
    {
        realwinning = true;
        realwinOpacity = 1;

        congratsText = new PIXI.Text("you won!", {font:"90px HelveticaNeue-UltraLight", fill:"0x7f8c8d"});

        if(lost == true)
        {
            congratsText = new PIXI.Text("you lose.", {font:"90px HelveticaNeue-UltraLight", fill:"0x7f8c8d"});
        }
        congratsText.anchor.x = 0.5;
        congratsText.anchor.y = 0.5;
        congratsText.position.x = 500;
        congratsText.position.y = 200;
        stage.addChild(congratsText);

        homebuttonbg = new PIXI.Sprite(new PIXI.Texture.fromImage("buttonbg.png"));
        homebuttonbg.anchor.x = 0.5;
        homebuttonbg.anchor.y = 0.5;
        homebuttonbg.position.x = 300;
        homebuttonbg.position.y = 480;
        homebuttonbg.scale = new PIXI.Point(0,0);
        stage.addChild(homebuttonbg);
        homebuttonbg.setInteractive(true);

        homebuttonbg.mouseover = function(mouseData){
           homebuttonsize = 1;
        }
        homebuttonbg.mouseout = function(mouseData){
           homebuttonsize = 0.8;
        }
        homebuttonbg.click = function(mouseData){
           location.href = "../";
        }

        homebutton = new PIXI.Sprite(new PIXI.Texture.fromImage("home.png"));
        homebutton.anchor.x = 0.5;
        homebutton.anchor.y = 0.5;
        homebutton.position.x = 300;
        homebutton.position.y = 480;
        homebutton.scale = new PIXI.Point(0,0);
        stage.addChild(homebutton);

        reloadbuttonbg = new PIXI.Sprite(new PIXI.Texture.fromImage("buttonbg.png"));
        reloadbuttonbg.anchor.x = 0.5;
        reloadbuttonbg.anchor.y = 0.5;
        reloadbuttonbg.position.x = 700;
        reloadbuttonbg.position.y = 480;
        reloadbuttonbg.scale = new PIXI.Point(0,0);
        stage.addChild(reloadbuttonbg);
        reloadbuttonbg.setInteractive(true);

        reloadbuttonbg.mouseover = function(mouseData){
           reloadbuttonsize = 1;
        }
        reloadbuttonbg.mouseout = function(mouseData){
           reloadbuttonsize = 0.8;
        }
        reloadbuttonbg.click = function(mouseData){
           location.reload(true);
        }

        reloadbutton = new PIXI.Sprite(new PIXI.Texture.fromImage("reload.png"));
        reloadbutton.anchor.x = 0.5;
        reloadbutton.anchor.y = 0.5;
        reloadbutton.position.x = 700;
        reloadbutton.position.y = 480;
        reloadbutton.scale = new PIXI.Point(0,0);
        stage.addChild(reloadbutton);


    }
}

function movePlayer(direction,howMuch)
{
    if(direction == "left")
    {
        bunnies[clientnumber].position.x -= howMuch;
    }
    if(direction == "right")
    {
        bunnies[clientnumber].position.x += howMuch;
    }
    if(direction == "up")
    {
        bunnies[clientnumber].position.y += howMuch;
    }
    if(direction == "down")
    {
        bunnies[clientnumber].position.y -= howMuch;
    }

    if(bunnies[clientnumber].position.x > 975)
    {
        bunnies[clientnumber].position.x = 975;
    }
    if(bunnies[clientnumber].position.x < 25)
    {
        bunnies[clientnumber].position.x = 25;
    }
    if(bunnies[clientnumber].position.y > 575)
    {
        bunnies[clientnumber].position.y = 575;
    }
    if(bunnies[clientnumber].position.y < 25)
    {
        bunnies[clientnumber].position.y = 25;
    }
}


function animate() {

    requestAnimFrame( animate );

    //ok i think this is the update function.

    // just for fun, lets rotate mr rabbit a little
    //bunnies[0].rotation += 0.1;

    if(loadedItself)
    {

    var hasMoved = false;

    if(keysDown.left == true)
    {
        movePlayer("left",4);
        hasMoved = true;
        playerdirection = "left";
    }
    if(keysDown.right == true)
    {
        movePlayer("right",4);
        hasMoved = true;
        playerdirection = "right";
    }
    if(keysDown.up == true)
    {
        movePlayer("up",4);
        hasMoved = true;
        playerdirection = "up";
    }
    if(keysDown.down == true)
    {
        movePlayer("down",4);
        hasMoved = true;
        playerdirection = "down";
    }


    if(playerdirection == "left")
    {
        movePlayer("left",dashingvalue);
        //hasMoved = true;
    }
    if(playerdirection == "right")
    {
        movePlayer("right",dashingvalue);
        //hasMoved = true;
    }
    if(playerdirection == "up")
    {
        movePlayer("up",dashingvalue);
        //hasMoved = true;
    }
    if(playerdirection == "down")
    {
        movePlayer("down",dashingvalue);
        //hasMoved = true;
    }





    if(dashingvalue > 0)
    {
        dashingvalue = (dashingvalue/2) - 1;
        hasMoved = true;
    }
    else
    {
        dashingvalue = 0;
    }

    if(dashCD > 0)
    {
        dashCD -= 1;
        //console.log(dashCD);
    }
    if(shieldCD > 0)
    {
        shieldCD -= 1;
    }
    if(shootCD > 0)
    {
        shootCD -= 1;
    }



    if(hasMoved)
    {
        //console.log("i moved");
        socket.emit("move",{x: bunnies[clientnumber].position.x, y: bunnies[clientnumber].position.y, clientnumber: clientnumber, room: room});
    }

    if(bullet)
    {

        var bulletspeed = 16;
        if(bulletdirection == "left")
        {
            bullet.position.x -= bulletspeed;
        }
        if(bulletdirection == "right")
        {
            bullet.position.x += bulletspeed;
        }
        if(bulletdirection == "up")
        {
            bullet.position.y += bulletspeed;
        }
        if(bulletdirection == "down")
        {
            bullet.position.y -= bulletspeed;
        }

        socket.emit("bulletmove",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber, room: room});

        if(bullet.position.x > bulletorigin.x + 300)
        {
            socket.emit("bulletdestroy",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber, room: room});
            stage.removeChild(bullet);
            bullet = null;
        }
        else if(bullet.position.x < bulletorigin.x - 300)
        {
            socket.emit("bulletdestroy",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber, room: room});
            stage.removeChild(bullet);
            bullet = null;
        }
        else if(bullet.position.y > bulletorigin.y + 300)
        {
            socket.emit("bulletdestroy",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber, room: room});
            stage.removeChild(bullet);
            bullet = null;
        }
        else if(bullet.position.y < bulletorigin.y - 300)
        {
            socket.emit("bulletdestroy",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber, room: room});
            stage.removeChild(bullet);
            bullet = null;
        }
    }

    if(shield)
    {
        shield.position = bunnies[clientnumber].position;
        if(shieldscale < 1)
        {
            shieldscale = shieldscale + 1;
            shield.scale = new PIXI.Point(shieldscale,shieldscale);
        }
        if(shieldalpha > 0.1 && shieldscale > 1)
        {
            shieldalpha = shieldalpha - 0.05;
            shield.alpha = shieldalpha;
        }
        if(shieldalpha <= 0.1)
        {
            //remove shield
            stage.removeChild(shield);
            shield = null;
        }

        if(enemybulletup)
        {

            if(isColliding(enemybullet,shield))
            {
                socket.emit("bulletBlocked",{clientnumber: clientnumber, room: room});
                stage.removeChild(enemybullet);
                enemybullet = null;
                enemybulletup = false;
            }

        }

    }


    if(enemyshield)
    {
        //shield.position = bunnies[clientnumber].position;
        if(enemyshieldscale < 1)
        {
            enemyshieldscale = enemyshieldscale + 1;
            enemyshield.scale = new PIXI.Point(enemyshieldscale,enemyshieldscale);
        }
        if(enemyshieldalpha > 0.1 && enemyshieldscale > 1)
        {
            enemyshieldalpha = enemyshieldalpha - 0.05;
            enemyshield.alpha = enemyshieldalpha;
        }
        if(enemyshieldalpha <= 0.1)
        {
            //remove shield
            stage.removeChild(enemyshield);
            enemyshield = null;
        }
    }


    if(enemybulletup)
    {
        if(isColliding(enemybullet,bunnies[clientnumber]))
        {
            //dead.
            socket.emit("gameOver",{loser: clientnumber, room: room});
        }
    }

    if(bullet)
    {
    	if(hasLoaded)
    	{
    		var x;
    		if(clientnumber == 0)
    		{
				x = 1;
			}
			else
			{
				x = 0;
			}
    		if(isColliding(bullet,bunnies[x]))
    		{
    			socket.emit("gameOver",{loser: x, room: room});
    		}
    	}


    		var tempSprite = new PIXI.Sprite(shot);
			tempSprite.anchor.x = 0.5;
			tempSprite.alpha = 1;
			tempSprite.anchor.y = 0.5;
			tempSprite.position.y = bullet.position.y;
			tempSprite.position.x = bullet.position.x;
			stage.addChild(tempSprite);

			trails.push(tempSprite);






    }

    for(var i = 0; i < 10; i++)
	{
		stripes[i].position.x += 1;
		if(stripes[i].position.x > 2000)
		{
			stripes[i].position.x = 0;
		}
	}

	for(var i = 0; i < trails.length; i++)
	{
		trails[i].alpha -= 0.2;
		//console.log(trails[i].alpha);
		if(trails[i].alpha < 0.01)
		{
			//console.log("lagg");
			stage.removeChild(trails[i]);
			trails.splice(i,1);
		}
	}


	if(winning)
	{
		// twistFilter.angle = twistangle;
		// twistangle = twistangle * 1.1;
		// console.log(twistangle);
		// twistFilter.radius = 1.0;

		// if(twistFilter.angle > 10)
		// {
		// 	winning = false;
		// 	twistFilter.angle = 0;
		// }

		// var x;

		// if(clientnumber == 0)
		// {
		// 	x = 1;
		// }
		// else
		// {
		// 	x = 0;
		// }

		// twistFilter.offset.x = (0 + bunnies[x].position.x)/1000;
		// twistFilter.offset.y = (600 - bunnies[x].position.y)/600;


			deathexplosion.alpha -= 0.02;
			deathexplosion.scale.x += 0.1;
			deathexplosion.scale.y += 0.1;

			if(deathexplosion.alpha < 0)
			{
				realWin();
			}

	}



    //LETS DRAW GRAPHICS
    dashCooldown.clear();
    dashCooldown.clear();
    dashCooldown.clear();
    dashCooldown.clear();

    if(!realwinning)
    {

    dashCooldown.lineStyle(2, 0x0000FF, 1);
    dashCooldown.drawRect(14, 14+40, 102, 12);
    dashCooldown.lineStyle(0);
    dashCooldown.beginFill(0x8e44ad, 1);
    dashCooldown.drawRect(15, 15+40, 100 - (shieldCD/2), 10);
    dashCooldown.endFill();

    dashCooldown.lineStyle(2, 0x0000FF, 1);
    dashCooldown.drawRect(14, 14+20, 102, 12);
    dashCooldown.lineStyle(0);
    dashCooldown.beginFill(0x8e44ad, 1);
    dashCooldown.drawRect(15, 15+20, 100 - (dashCD*2), 10);
    dashCooldown.endFill();

    dashCooldown.lineStyle(2, 0x0000FF, 1);
    dashCooldown.drawRect(14, 14, 102, 12);
    dashCooldown.lineStyle(0);
    dashCooldown.beginFill(0x8e44ad, 1);
    dashCooldown.drawRect(15, 15, 100 - (shootCD * 5.26315789), 10);
    dashCooldown.endFill();

    dashCooldown.lineStyle(0);
    dashCooldown.beginFill(0xc0392b);
    dashCooldown.moveTo(0,0);
    dashCooldown.lineTo(1000,0);
    dashCooldown.lineTo(openingAnimationCounter/2,(openingAnimationCounter/10)*3);
    dashCooldown.lineTo(0,600);
    dashCooldown.lineTo(0,0);
    dashCooldown.endFill();

    dashCooldown.lineStyle(0);
    dashCooldown.beginFill(0xc0392b);
    dashCooldown.moveTo(0,600);
    dashCooldown.lineTo(1000 - (openingAnimationCounter/2),600-((openingAnimationCounter/10)*3));
    dashCooldown.lineTo(1000,0);
    dashCooldown.lineTo(1000,600);
    dashCooldown.endFill();

    }


    dashCooldown.lineStyle(0);
    dashCooldown.beginFill(0xFFFFFF, screenFlashOpacity);
    dashCooldown.drawRect(0,0,1000,600);
    dashCooldown.endFill();

    if(realwinning)
    {
        dashCooldown.lineStyle(0);
        dashCooldown.beginFill(0xFFFFFF, 1);
        dashCooldown.drawRect(0,200-(realwinOpacity/2),1000,realwinOpacity);
        dashCooldown.endFill();

        if(realwinOpacity < 300)
        {
            realwinOpacity += 5;
        }


        if(lost)
        {
            var x;
            if(clientnumber == 0)
            {
                x = 1;
            }
            else
            {
                x = 0;
            }

            if(bunnies[x])
            {

                if(bunnies[x].scale.x < 40)
                {
                    bunnies[x].scale.x = bunnies[x].scale.x * 1.1;
                    bunnies[x].scale.y = bunnies[x].scale.y * 1.1;
                }

            }
        }
        else
        {
            if(bunnies[clientnumber].scale.x < 40)
            {
                bunnies[clientnumber].scale.x = bunnies[clientnumber].scale.x * 1.1;
                bunnies[clientnumber].scale.y = bunnies[clientnumber].scale.y * 1.1;
            }
        }


        if(homebutton.scale.x < homebuttonsize)
        {
            homebutton.scale.x += 0.02;
            homebutton.scale.y += 0.02;
        }

        if(homebuttonbg.scale.x < homebuttonsize)
        {
            homebuttonbg.scale.x += 0.02;
            homebuttonbg.scale.y += 0.02;
        }

        if(reloadbutton.scale.x < reloadbuttonsize)
        {
            reloadbutton.scale.x += 0.02;
            reloadbutton.scale.y += 0.02;
        }

        if(reloadbuttonbg.scale.x < reloadbuttonsize)
        {
            reloadbuttonbg.scale.x += 0.02;
            reloadbuttonbg.scale.y += 0.02;
        }



        if(homebutton.scale.x > homebuttonsize)
        {
            homebutton.scale.x -= 0.02;
            homebutton.scale.y -= 0.02;
        }

        if(homebuttonbg.scale.x > homebuttonsize)
        {
            homebuttonbg.scale.x -= 0.02;
            homebuttonbg.scale.y -= 0.02;
        }

        if(reloadbutton.scale.x > reloadbuttonsize)
        {
            reloadbutton.scale.x -= 0.02;
            reloadbutton.scale.y -= 0.02;
        }

        if(reloadbuttonbg.scale.x > reloadbuttonsize)
        {
            reloadbuttonbg.scale.x -= 0.02;
            reloadbuttonbg.scale.y -= 0.02;
        }





    }

    stage.removeChild(dashCooldown);
    stage.addChild(dashCooldown);


    if(realwinning)
    {
        stage.removeChild(congratsText);
        stage.addChild(congratsText);
        stage.removeChild(homebuttonbg);
        stage.addChild(homebuttonbg);
        stage.removeChild(reloadbuttonbg);
        stage.addChild(reloadbuttonbg);
        stage.removeChild(homebutton);
        stage.addChild(homebutton);
        stage.removeChild(reloadbutton);
        stage.addChild(reloadbutton);
    }

    if(screenFlashOpacity > 0)
    {
    	screenFlashOpacity -= 0.1;
    }




    if(openingAnimationCounter > 0.5)
    {
        openingAnimationCounter = openingAnimationCounter / 1.1;
    }


    // render the stage
    renderer.render(stage);
}
}

function makeShield()
{
    //console.log("shieldmakebegin");
    if(shieldCD == 0)
    {
        if(!shield)
        {
            //console.log("shieldmake");
            shield = new PIXI.Sprite(circletexture);
            shield.anchor.x = 0.5;
            shield.anchor.y = 0.5;
            shield.position.x = bunnies[clientnumber].position.x;
            shield.position.y = bunnies[clientnumber].position.y;
            stage.addChild(shield);
            shieldscale = 0.01;
            shieldalpha = 1;
            shield.scale = new PIXI.Point(0,0);
            shieldCD = 200;

            socket.emit("shield",{x: shield.position.x, y: shield.position.y, clientnumber: clientnumber, room: room});

}
}
}


function shootBullet()
{
    if(!bullet)
    {
        bullet = new PIXI.Sprite(shot);
        //bullet.scale = 0.5;
        bullet.anchor.x = 0.5;
        bullet.anchor.y = 0.5;
        bullet.position.x = bunnies[clientnumber].position.x;
        bullet.position.y = bunnies[clientnumber].position.y;
        stage.addChild(bullet);
        bulletorigin = bunnies[clientnumber].position;
        bulletdirection = playerdirection;
        shootCD = 19;
        //console.log(bulletorigin.x);
        //console.log(bulletorigin.y);
    }
}

function dash()
{
    if(dashCD == 0)
    {
        dashingvalue = 50;
        dashCD = 50;
    }
    // if(playerdirection == "left")
    // {
    //     bunnies[clientnumber].position.x -= 70;
    // }
    // if(playerdirection == "right")
    // {
    //     bunnies[clientnumber].position.x += 70;
    // }
    // if(playerdirection == "up")
    // {
    //     bunnies[clientnumber].position.y += 70;
    // }
    // if(playerdirection == "down")
    // {
    //     bunnies[clientnumber].position.y -= 70;
    // }
}


function isColliding(sprite1,sprite2)
{
    distance = Math.sqrt(((sprite1.position.x - sprite2.position.x) * (sprite1.position.x - sprite2.position.x)) + ((sprite1.position.y - sprite2.position.y) * (sprite1.position.y - sprite2.position.y)));
    if (distance < (sprite1.width + sprite2.width)/2)
    {
        return true;
    }
    else
    {
        return false;
    }
}

document.addEventListener('keydown', function(event) {

    if(winning == false)
    {
        if(event.keyCode == 37) {
            keysDown.left = true;
            playerdirection = "left";
        }
        if(event.keyCode == 39) {
            keysDown.right = true;
            playerdirection = "right";
        }
        if(event.keyCode == 40) {
            keysDown.up = true;
            playerdirection = "up";
        }
        if(event.keyCode == 38) {
            keysDown.down = true;
            playerdirection = "down";
        }
        if(event.keyCode == 81) {
            //console.log("pressed q");
            shootBullet();
        }
        if(event.keyCode == 87) {
            //console.log("pressed q");
            dash();
        }
        if(event.keyCode == 69) {
            //console.log("pressed q");
            makeShield();
        }
    }
});

document.addEventListener('keyup', function(event) {
    if(event.keyCode == 37) {
        keysDown.left = false;
    }
    if(event.keyCode == 39) {
        keysDown.right = false;
    }
    if(event.keyCode == 40) {
        keysDown.up = false;
    }
    if(event.keyCode == 38) {
        keysDown.down = false;
    }
});