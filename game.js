
var socket = io.connect('http://10.0.1.16:8000');
// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x66FF99);

// create a renderer instance
var renderer = PIXI.CanvasRenderer(640, 480);

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);


var keysDown = {
    left: false,
    right: false,
    up: false,
    down: false
};

var clientnumber = -1;

socket.emit("firstConnect",{message: "chicken"});

// create a texture from an image path
var texture = PIXI.Texture.fromImage("bunny.png");
// create a new Sprite using the texture

var bunnies = [];
var playerdirection = "left";

var bullet;
var bulletorigin;
var bulletdirection;

var enemybullet;
var enemybulletorigin;
var enemybulletdirection;

var dashingvalue = 0;



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
            var text = new PIXI.Text("Bunny " + (i+1).toString(), {font:"20px Helvetica", fill:"white"});
            text.position.x = -40;
            text.position.y = -50;
            bunnies[i].addChild(text);
        }
        requestAnimFrame( animate );

    }
    else
    {
        if(data.clientnumber < 2)
        {
            bunnies[data.clientnumber] = new PIXI.Sprite(texture);
            // center the sprites anchor point
            bunnies[data.clientnumber].anchor.x = 0.5;
            bunnies[data.clientnumber].anchor.y = 0.5;
            // move the sprite t the center of the screen
            bunnies[data.clientnumber].position.x = 200;
            bunnies[data.clientnumber].position.y = 150;
            stage.addChild(bunnies[data.clientnumber]);
            var text = new PIXI.Text("Bunny " + (i+1).toString(), {font:"20px Helvetica", fill:"white"});
            text.position.x = -40;
            text.position.y = -50;
            bunnies[i].addChild(text);
        }
    }
});

socket.on('someoneMoved', function (data)
{
    //console.log(data.clientnumber);
    bunnies[data.clientnumber].position.x = data.x;
    bunnies[data.clientnumber].position.y = data.y;
    //console.log("move");

});

socket.on('someoneMovedBullet', function (data)
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
            enemybullet = new PIXI.Sprite(texture);
            //bullet.scale = 0.5;
            enemybullet.anchor.x = 0.5;
            enemybullet.anchor.y = 0.5;
            enemybullet.position.x = data.x;
            enemybullet.position.y = data.y;
            stage.addChild(enemybullet);
            enemybulletorigin = enemybullet.position;
        }
    }

});


socket.on('someoneDestroyedBullet', function (data)
{
    if(data.clientnumber != clientnumber)
    {
        stage.removeChild(enemybullet);
        enemybullet = null;
        console.log("boom");
    }

});



function animate() {

    requestAnimFrame( animate );

    //ok i think this is the update function.

    // just for fun, lets rotate mr rabbit a little
    //bunnies[0].rotation += 0.1;

    var hasMoved = false;

    if(keysDown.left == true)
    {
        bunnies[clientnumber].position.x -= 4;
        hasMoved = true;
        playerdirection = "left";
    }
    if(keysDown.right == true)
    {
        bunnies[clientnumber].position.x += 4;
        hasMoved = true;
        playerdirection = "right";
    }
    if(keysDown.up == true)
    {
        bunnies[clientnumber].position.y += 4;
        hasMoved = true;
        playerdirection = "up";
    }
    if(keysDown.down == true)
    {
        bunnies[clientnumber].position.y -= 4;
        hasMoved = true;
        playerdirection = "down";
    }


    if(playerdirection == "left")
    {
        bunnies[clientnumber].position.x -= dashingvalue;
        hasMoved = true;
    }
    if(playerdirection == "right")
    {
        bunnies[clientnumber].position.x += dashingvalue;
        hasMoved = true;
    }
    if(playerdirection == "up")
    {
        bunnies[clientnumber].position.x += dashingvalue;
        hasMoved = true;
    }
    if(playerdirection == "down")
    {
        bunnies[clientnumber].position.x -= dashingvalue;
        hasMoved = true;
    }



    if(dashingvalue > 0)
    {
        dashingvalue = (dashingvalue/2) - 1;
    }
    else
    {
        dashingvalue = 0;
    }



    if(hasMoved)
    {
        //console.log("i moved");
        socket.emit("move",{x: bunnies[clientnumber].position.x, y: bunnies[clientnumber].position.y, clientnumber: clientnumber});
    }

    if(bullet)
    {
        if(bulletdirection == "left")
        {
            bullet.position.x -= 12;
        }
        if(bulletdirection == "right")
        {
            bullet.position.x += 12;
        }
        if(bulletdirection == "up")
        {
            bullet.position.y += 12;
        }
        if(bulletdirection == "down")
        {
            bullet.position.y -= 12;
        }

        if(bullet.position.x > bulletorigin.x + 300)
        {
            socket.emit("bulletdestroy",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber});
            stage.removeChild(bullet);
            bullet = null;
        }
        else if(bullet.position.x < bulletorigin.x - 300)
        {
            socket.emit("bulletdestroy",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber});
            stage.removeChild(bullet);
            bullet = null;
        }
        else if(bullet.position.y > bulletorigin.y + 300)
        {
            socket.emit("bulletdestroy",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber});
            stage.removeChild(bullet);
            bullet = null;
        }
        else if(bullet.position.y < bulletorigin.y - 300)
        {
            socket.emit("bulletdestroy",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber});
            stage.removeChild(bullet);
            bullet = null;
        }

        socket.emit("bulletmove",{x: bullet.position.x, y: bullet.position.y, clientnumber: clientnumber});
    }

    // render the stage
    renderer.render(stage);
}


function shootBullet()
{
    if(!bullet)
    {
        bullet = new PIXI.Sprite(texture);
        //bullet.scale = 0.5;
        bullet.anchor.x = 0.5;
        bullet.anchor.y = 0.5;
        bullet.position.x = bunnies[clientnumber].position.x;
        bullet.position.y = bunnies[clientnumber].position.y;
        stage.addChild(bullet);
        bulletorigin = bunnies[clientnumber].position;
        bulletdirection = playerdirection;
        //console.log(bulletorigin.x);
        //console.log(bulletorigin.y);
    }
}

function dash()
{
    dashingvalue = 50;
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

document.addEventListener('keydown', function(event) {
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