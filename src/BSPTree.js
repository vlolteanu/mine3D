var BSPTree = {

	root : null,

	createPartition : function( elements ) {

		this.root = new BSPNode().init( elements, 0 );

	},

	draw : function( gl, position ) {

		if ( this.root ) {

			this.root.draw( gl, position );

		}

	},

	print : function() {

		console.log("root " + vec3.str(this.root.position));
		this.root.print( 1 );

	}

};