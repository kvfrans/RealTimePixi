
var socket = io.connect('http://10.0.1.16:8000');
// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x66FF99);

// create a renderer instance
var renderer = PIXI.autoDetectRenderer(640, 480);

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







//SOCKET CALLBACKS
socket.on('imConnected', function (data)
{
	if(clientnumber == -1)
	{
		clientnumber = data.clientnumber;
		//console.log(clientnumber);

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
});

socket.on('someoneMoved', function (data)
{
	//console.log(data.clientnumber);
	bunnies[data.clientnumber].position.x = data.x;
	bunnies[data.clientnumber].position.y = data.y;
	//console.log("move");

});



function animate() {

    requestAnimFrame( animate );

    //ok i think this is the update function.

    // just for fun, lets rotate mr rabbit a little
    //bunnies[0].rotation += 0.1;

    var hasMoved = false;

    if(keysDown.left == true)
    {
    	bunnies[clientnumber].position.x -= 8;
    	hasMoved = true;
    }
    if(keysDown.right == true)
    {
    	bunnies[clientnumber].position.x += 8;
    	hasMoved = true;
    }
    if(keysDown.up == true)
    {
    	bunnies[clientnumber].position.y += 8;
    	hasMoved = true;
    }
    if(keysDown.down == true)
    {
    	bunnies[clientnumber].position.y -= 8;
    	hasMoved = true;
    }

    if(hasMoved)
    {
    	//console.log("i moved");
    	socket.emit("move",{x: bunnies[clientnumber].position.x, y: bunnies[clientnumber].position.y, clientnumber: clientnumber});
    }

    // render the stage
    renderer.render(stage);
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37) {
        keysDown.left = true;
    }
    if(event.keyCode == 39) {
        keysDown.right = true;
    }
    if(event.keyCode == 40) {
        keysDown.up = true;
    }
    if(event.keyCode == 38) {
        keysDown.down = true;
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