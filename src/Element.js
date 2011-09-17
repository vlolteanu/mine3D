var Element = function( index, position ) {

	this.index = index;
	this.position = position;

	this.cube = new Cube( this );
	this.neighbors = [];

	this.reset();

};

Element.prototype = {

	reset : function() {

		this.state = "cube"; // [ 'cube', 'number', 'flag', 'mine', 'open' ]

		this.value = 0;
		this.maxValue = 0;
		this.isMine = false;
		this.highlight = false;

	},

	restart : function() {

		this.state = "cube";

		this.value = this.maxValue;
		this.highlight = false;

	},

	addNeighbor : function( neighbor, reverse ) {

		this.neighbors.push( neighbor );

		if ( reverse ) {

			neighbor.addNeighbor( this, false );

		}

	},

	increaseValue : function() {

		this.value++;
		this.maxValue++;

	},

	decreaseValue : function() {

		if ( --this.value == 0 && this.state != "cube" ) {

			this.openEmpty();

		}

	},

	setMine : function() {

		this.isMine = true;

		var i, neighbors = this.neighbors;

		for ( i = 0; i < neighbors.length; i++ ) {

			neighbors[i].increaseValue();

		}

	},

	showMine : function() {

		this.state = "mine";

		this.value = 28;

	},

	draw : function( gl ) {

		var state = this.state;

		gl.pushMatrix();
		mat4.translate(gl.matrix, this.position);

		if ( state == "number" || state == "mine" ) {

			Face.draw( gl, Element.shader, this.value );

		} else {

			Cube.draw( gl, Element.shader, this.state == "flag", this.highlight );

		}

		gl.popMatrix();

	},

	open : function() {

		if ( this.state == "cube" ) {

			if ( this.isMine ) {

				Game.over();

			} else if ( this.value ) {

				this.state = "number";

			} else {

				this.openEmpty();

			}

		}

	},

	openEmpty : function() {

		var i = 0,
			neighbors = this.neighbors;

		this.state = "open";

		BSPTree.remove( this );

		do {

			neighbors[i].open();

		} while ( ++i < neighbors.length );

	},

	openMine : function() {

		var i,
			neighbors;

		if ( this.state == "cube" ) {

			if ( this.isMine ) {

				this.state = "open";

				neighbors = this.neighbors;

				for ( i = 0; i < neighbors.length; i++ ) {

					neighbors[i].decreaseValue();

				}


				if ( this.value ) {

					this.state = "number";

				} else {

					this.openEmpty();

				}

			} else {

				Game.over();

			}

		}

	},


	flag : function() {

		if ( this.state == "cube" ) {

			this.state = "flag";

		} else {

			this.state = "cube";

		}

	},

	remove : function( element ) {

		if ( this.index == element.index ) {

			return 0;

		} else {

			console.log("wtf");
			throw "wtf";

		}

	},

	count : function() {

		return 1;

	},

	print : function( str ) {

		str += "    ";

		console.log( str + vec3.str( this.position ) );

	}

};

extend( Element, {

	init : function( gl ) {

		this.initShader( gl );

		this.initTextures( gl );

		Cube.initBuffers( gl );
		Face.initBuffers( gl );

		gl.uniformMatrix4fv( this.shader.pMatrixUniform, false, Camera.getPMatrix() );

	},

	initShader : function( gl ) {

		var shader = gl.loadShader( "vertex-shader", "fragment-shader" );
		gl.useProgram(shader);

		shader.mvMatrixUniform = gl.getUniformLocation( shader, "uMVMatrix" );
		shader.pMatrixUniform = gl.getUniformLocation( shader, "uPMatrix" );

		shader.textureUniform = gl.getUniformLocation( shader, "uTexture" );

		shader.positionAttribute = gl.getAttribLocation( shader, "aPosition" );
		gl.enableVertexAttribArray( shader.positionAttribute );

		shader.colorAttribute = gl.getAttribLocation( shader, "aColor" );
		gl.enableVertexAttribArray( shader.colorAttribute );
		
		shader.texCoordAttribute = gl.getAttribLocation( shader, "aTextureCoord" );
		gl.enableVertexAttribArray( shader.texCoordAttribute );

		this.shader = shader;

	},

	initTextures : function( gl ) {

		this.texture = gl.loadTexture( "textures/numbers.png", function( gl, texture ) {

			gl.passTexture( texture, Element.shader.textureUniform );
			Grid.redraw = true;

		});

	}

});
