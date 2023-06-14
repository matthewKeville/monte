
  //////////////
	// Scene
	//////////////
	const scene = new THREE.Scene();

	//////////////
	// Camera
	/////////////

	//Perspective Camera is just one type of camera (FOV, Aspect Ratio, near , far)
	const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 1000 );

	///////////////
	// Renderer
	///////////////

	//WebGL is preferred renderer but there are fallbacks for older browsers that don't support WebGL
	const renderer = new THREE.WebGLRenderer();
	//Can add boolean arg, as third argument to make the width,height a resolution of the canvas
	//otherwise width, height will make the render size that size and resolution.
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	/////////////////
	// Light
	/////////////////
	//const hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1);

	const hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1);
	hemiLight.position.y = 100000;
	scene.add(hemiLight);


  //////////////////
  // Colors
  /////////////////

  const colors = ['Aqua','Aquamarine','Blue','BlueViolet','Brown','Chartreuse','Chocolate','Crimson','DarkOrange','DarkRed','DarkKhaki',
  'Firebrick','FloarWhite','Fuchsia','Gold','Gray','Goldenrod','Web Green','HotPink','LightGreen','Lime','Magenta','MediumBlue','MediumSpringGreen'];


  /////////////////
  // Orbit controls for camera
  /////////////////


	////////////////
	//Entities ...
	///////////////

  class Table extends THREE.Mesh {
    constructor() {
      let matGeometry = new THREE.PlaneGeometry(240, 60);
      let matMaterial = new THREE.MeshLambertMaterial( { color : 0xffffff } );
      super( matGeometry, matMaterial );
      scene.add(this);
    }
  }


  class Ball extends THREE.Mesh {

    constructor() {
      let ballMaterial = new THREE.MeshLambertMaterial( { color: 0xFF00FF } );
      let ballGeometry = new THREE.SphereGeometry(  3 , 20 , 20 );
      super(ballGeometry,ballMaterial);
    }
  }


  /* 
   * Cups and Balls occupy spots and they are the basis by which we 
   * calculate the state for transitions
   */
  class Spot extends THREE.Mesh {
    constructor(x) {

      let spotGeometry = new THREE.CircleGeometry(5,50);
      let spotMaterial = new THREE.MeshLambertMaterial();

      spotMaterial.color = new THREE.Color("Blue");
      super(spotGeometry,spotMaterial);

      //initial placement
      this.position.x = x;
      this.position.y = 0.1;
      this.rotateX(-Math.PI/2);

      //state
      this.hasBall = false;
      this.hasCup  = false;;

      //add cup to global scene
      scene.add(this);
    }


    isEmpty() {
      return !this.hasBall && !this.hasCup;
    }

    ready() {

      if (!this.hasBall && !this.hasCup) {
        return true;
      } else if (this.hasCup) {
        return this.cup.ready;
      } else {
        return true;
      }
    }

    update() {
      if (this.hasCup) {
        this.cup.update();
      }
    }

    addCup ( cup ) {
      this.hasCup = true;
      this.cup = cup;
    }

    addBall ( ball ) {
      this.hasBall = true;
      this.ball = ball;
    }

    removeCup () {
      this.hasCup = false;
      let tcup = this.cup;
      this.cup = null;
      return tcup;
    }

    removeBall ( ) {
      this.hasBall = false;
      let tball = this.ball
      this.ball = null;
      return tball;
    }


  }

  /*
   * 
   */
  class Cup extends THREE.Mesh  {
    static frameCount = 60;
    constructor(x,name) {

      let cupMaterial = new THREE.MeshLambertMaterial( { color: 0x830fff } );
      let cupGeometry = new THREE.CylinderGeometry( 5 , 5 , 15 , 25 );
      //cupMaterial.transparent = true;
      //cupMaterial.opacity = .50;

      super(cupGeometry,cupMaterial);
      //initial placement
      this.position.x = x;
      this.position.y = 7.5;

      //animation state
      this.t = 0;
      this.frames = 0;
      this.swapping = false;
      this.revealing = false;
      this.reaveled = false;
      this.ready = true;
      this.hasBall = false;
      this.ball;

      this.name = name;

      //add cup to global scene
      scene.add(this);

    }

    update() {
      //swapping transition
      //
      if (this.swapping == true) {
        
        if (this.t <= this.frames) {
          this.position.x = this.transition(this.t)[0];
          this.position.y = this.transition(this.t)[1];
          this.position.z = this.transition(this.t)[2];
          this.t+=1;
        } else {
          //animation ending change swapping to false
          this.swapping = false;
          this.ready = true;
        }

      } else if (this.translating == true ) {
        if (this.t <= this.frames) {
          this.position.x = this.transition(this.t)[0];
          this.position.y = this.transition(this.t)[1];
          this.position.z = this.transition(this.t)[2];
          this.t+=1;
        } else {
          this.translating = false;
          this.ready = true;
        }

      //revealing transition
        
      } else if (this.revealing == true) {
        if (this.t <= this.frames) {
          this.position.x = this.transition(this.t)[0];
          this.position.y = this.transition(this.t)[1];
          this.position.z = this.transition(this.t)[2];
          this.t+=1;
        } else {
          //animation ending change swapping to false
          this.revealing = false;
          this.ready = true;
          this.revealed = true;
        }

      //hiding transition
        
      } else if (this.hiding == true) {
        if (this.t <= this.frames) {
          this.position.x = this.transition(this.t)[0];
          this.position.y = this.transition(this.t)[1];
          this.position.z = this.transition(this.t)[2];
          this.t+=1;
        } else {
          //animation ending change swapping to false
          this.hiding = false;
          this.ready = true;
          this.revealed = false;
          if ( this.hasBall) {
            Monte.attachBallMesh(this);
          }
        }
      //arcing

      } else if (this.arcing == true) {
        if (this.t <= this.frames) {
          this.position.x = this.transition(this.t)[0];
          this.position.y = this.transition(this.t)[1];
          this.position.z = this.transition(this.t)[2];
          this.t+=1;
        } else {
          //animation ending change swapping to false
          this.arcing = false;
          this.ready = true;
          if ( this.hasBall) {
            Monte.attachBallMesh(this);
          }
        }
      }



    }

  }

  /* Calculates transitions for cups and balls */
  class Monte {

    //add the ball to the cup ( symbolically )
    static addBall(cup,ball) {
      cup.ball = ball;
      cup.hasBall = true;
    }

    //remove the ball from the cup (symbolically)
    static removeBall(cup) {
      //free ball back to scene
      let tball = cup.ball;
      Monte.detachBallMesh(cup);
      cup.hasBall = false;
      cup.ball = null;
      return tball;
    }


    //attatch the ball mesh to the cups mesh
    //set a flag that it contains a ball
    //this will attach the ball symbolically linked to the cup
    static attachBallMesh(cup) {
      cup.add(cup.ball);
      cup.ball.position.z = 1.5;
      cup.ball.position.x = 0;
    }

    //attach the ball the to scene,
    //thus removing the ball from the cup
    //detach implies that the cup still holds
    //the ball position, but for purpose of revealing
    //it must be detached from the canvas
    static detachBallMesh(cup) {
      let ball = cup.ball;
      scene.add(ball);
      ball.position.x = cup.position.x;
      ball.position.y = 3;//cup.mesh.position.z;
    }

    //lift a cup upward
    static reveal(cup) {

      if (cup.hasBall) {
        Monte.detachBallMesh(cup);
      }

      cup.ready = false;
      cup.revealing = true;
      cup.revealed = false;
      cup.t = 0; 

      let ys = cup.position.y;
      let liftHeight = 20;
      let frames = 60;
      cup.frames = frames;

      let transition = function(t) {
        let x = cup.position.x;
        let y = (t*liftHeight/frames) + ys;
        let z = cup.position.z;
        return [x,y,z];
      }

      cup.transition = transition;

    }


    //lift a cup upward
    static hide(cup) {

      cup.ready = false;
      cup.hiding = true;
      cup.t = 0; 

      let liftHeight = 20;
      let ys = cup.position.y;
      let frames = 60;
      cup.frames = frames;

      let transition = function(t) {
        let x = cup.position.x;
        let y = ys - (t*liftHeight/frames);
        let z = cup.position.z;
        return [x,y,z];
      }

      cup.transition = transition;

    }


    //move a cup to an adjacent spot by translating on a linear path
    static translate(cupSpot,spot,speed) {
      let cup = cupSpot.cup;
      cup.ready = false;
      cup.translating = true;

      // ball / cup management

      //if cupSpot had a ball, then it needs to be moved
      //to the othe spot (spot)
      if ( cupSpot.hasBall ) {
        spot.addBall(cupSpot.removeBall());
      }

      //transfer the cups
      cupSpot.removeCup();
      spot.addCup(cup);

      cup.frames = 60*speed;

      let spotx = spot.position.x;
      let spoty = spot.position.y;
      let spotz = spot.position.z;

      let cupxstart = cup.position.x;
      let cupystart = cup.position.y;
      let cupzstart = cup.position.z;

      let dir = [spotx - cup.position.x , spoty - cup.position.y , spotz - cup.position.z];
      let norm = Math.sqrt( Math.pow(dir[0],2) + Math.pow(dir[1],2) + Math.pow(dir[2],2));
      let unit = [dir[0]/norm,dir[1]/norm,dir[2]/norm]

      let above = function(t) {
        let x = cupxstart + t * (norm /cup.frames) * (unit[0]);
        let y = cup.position.y
        let z = cup.position.z
        return [x,y,z];
      }
     
      cup.t = 0;
      cup.transition = above;


    }


    //swap to cups
    //s is seconds for the swap duration
    // 1 = 60 fms, .5 = 30 fms, .25 = .15 fms ...
    static swap(cupSpotA,cupSpotB,s,clockwise) {

      let a = cupSpotA.cup;
      let b = cupSpotB.cup;

      // Cup / Ball Management
      if ( cupSpotA.hasBall && cupSpotB.hasBall) {
        let aball = cupSpotA.ball;
        cupSpotA.addBall(cupSpotB.removeBall());
        cupSpotB.addBall(aball);
      } else if ( cupSpotA.hasBall ) {
        cupSpotB.addBall(cupSpotA.removeBall());
      } else if ( cupSpotB.hasBall ) {
        cupSpotA.addBall(cupSpotB.removeBall());
      }

      cupSpotA.removeCup();
      cupSpotA.addCup(b);

      cupSpotB.removeCup();
      cupSpotB.addCup(a);


      a.ready = false;
      b.ready = false;
      a.swapping = true;
      b.swapping = true;

      //which cup is leftward?
      //a greater than b
      let agtb = (a.position.x > b.position.x) ? true : false;


      //60 fps is the target
      let frames =  s*60;
      a.frames = frames;
      b.frames = frames;

      a.t = 0;
      b.t = 0;

      let gap = Math.abs(a.position.x - b.position.x);
      let cpx = 0;
      let cpy = a.position.y;
      let cpz = a.position.z;

      if (a.position.x > b.position.x) {
        cpx = a.position.x - gap/2;
      } else {
        cpx = a.position.x + gap/2;
      }

      let dir = (clockwise) ? 1 : -1;

      let above = function(t) {
        let x = gap/2*Math.cos(Math.PI*t*dir/frames) + cpx;
        let y = cpy;
        let z = gap/2*Math.sin(Math.PI*t*dir/frames) + cpz;
        return [x,y,z];
      }

      let below = function(t) {
        let x = gap/2*Math.cos(((Math.PI*t*dir)/frames)-Math.PI) + cpx;
        let y = cpy;
        let z = gap/2*Math.sin(((Math.PI*t*dir)/frames)-Math.PI) + cpz;
        return [x,y,z];
      }

      a.transition = (agtb) ? above : below;
      b.transition = (agtb) ? below : above;

    }


    //arc cup in cupSpotA over other cups to an empty spot cupSpotB
    //s is seconds for the swap duration
    // 1 = 60 fms, .5 = 30 fms, .25 = .15 fms ...
    static arc(cupSpotA,cupSpotB,s) {

      let a = cupSpotA.cup;
      let agtb = (cupSpotA.position.x > cupSpotB.position.x);

      a.ready = false;
      a.arcing = true;


      //60 fps is the target
      let frames =  s*60;
      a.frames = frames;
      a.t = 0;

      let gap = Math.abs(a.position.x - cupSpotB.position.x);
  
      let ax = a.position.x;
      let ay = a.position.y;
      let az = a.position.z;

      let rad = Math.abs((a.position.x - cupSpotB.position.x) / 2);

      let transition = function(t) {
        let x = 0;
        if ( !agtb ) {
          x = rad * Math.cos(Math.PI - (Math.PI*t/frames)) + cupSpotB.position.x -rad;
        } else {
          x = rad * Math.cos(Math.PI*t/frames) + ax - rad;
        }
        let y = rad * Math.sin(Math.PI*t/frames) + ay;
        let z = az;
        return [x,y,z];
      }

      a.transition = transition;

      // Cup / Ball Management

      //if A had a ball remove it
      if ( a.hasBall ) {
        //Cup.removeBall(cupSpotA.cup);
        //Then add a's ball to the cupSpot
        cupSpotA.addBall ( Monte.removeBall(cupSpotA.cup));

      }
      //if B has a ball attach to the cup from a
      if ( cupSpotB.hasBall ) {
        Monte.addBall( cupSpotA.cup, cupSpotB.ball );
      }

      //add the cup to the new spot, remove it from the old spot
      cupSpotB.addCup(cupSpotA.removeCup());
    }
  }


  class EventDispatcher {

    constructor(spotList,speedBag) {
      this.spotList = spotList;
      this.emptySpotIndicies = [];
      this.cupSpotIndicies = [];
      this.noCupSpotIndicies = [];
      this.translationSpotIndicies = [];
	    this.speedBag = speedBag;
      this.ballExposed = false;
      this.eventTrace = [];
    }

    pickSpeed() {
      return speedBag[Math.floor(Math.random()*this.speedBag.length)];
    }

    indexPick(spotList) {
      return spotList[Math.floor(Math.random()*spotList.length)];
    }

    //pick random spots heavily biased towards spots that contain balls
    biasedIndexPick(spotList,b) {
      let tempList = [];
      spotList.forEach( spot => {
        if ( spot.hasBall ) {
          //add spot with ball b times
          for ( let i = 0; i < b; i++) {
            tempList.push(spot);
          }
        //add spot without ball just once
        } else {
          tempList.push(spot);
        }
      });
      return tempList[Math.floor(Math.random()*tempList.length)];
    }

    //Re-calculate state of spot list
    update() {
      //do any spots have an exposed ball?
      this.ballExposed = false;
      this.spotList.forEach( spot => {
        if ( spot.hasBall && !spot.hasCup ) {
          this.ballExposed = true;
        }
      });

      //Get all spots with nothing in them
      this.emptySpotIndicies = [];
      for ( let i = 0; i < this.spotList.length; i++ ) {
        if ( this.spotList[i].isEmpty() ) {
          this.emptySpotIndicies.push(i);
        }
      }

      //get all spots with a cup
      this.cupSpotIndicies = [];
      for ( let i = 0; i < this.spotList.length; i++ ) {
        if (this.spotList[i].hasCup) {
          this.cupSpotIndicies.push(i);
        }
      }

      //get all spots without a cup , (empty or with ball)
      this.noCupSpotIndicies = [];
      for ( let i = 0; i < this.spotList.length; i++ ) {
        if ( ! this.cupSpotIndicies.includes(i) ) {
          this.noCupSpotIndicies.push(i);
        }
      }

      //Which empty spots are valid for a transition event
      //An empty spot is valid iff {
      // L ( spot ) = Empty , and L ( L ( spot ) ) = Empty , ... and the 
      // sequence of L ( spot,i ) terminates to a cup, without hitting a ball
      // That is it's sequence of neighbors L or R is a (Empty) * -> Cup
      // hold a map of [ spot index, [left validity, right validity ]]
      let validTranslationSpots = [];
      this.emptySpotIndicies.forEach ( i => {
        let validLeft = false;
        let validRight = false;
        //check left neighbor sequence
        let cupHit = false;
        let ballHit = false;
        let endHit = false;
        let j = i-1;
        if ( i == 0 ) { endHit = true; };
        while (!cupHit && !ballHit && !endHit) {
          if ( this.spotList[j].hasBall && !this.spotList[j].hasCup ) {
            ballHit = true;
          } else if ( this.spotList[j].hasCup ) {
            cupHit = true;
          } else {
            if ( j != 0 ) {
              j-=1;
            } else {
              endHit = true;
            }
          }
        }
        //this is a valid translation candidate
        if (cupHit) {
          validLeft = true;
        }

        //check right neighbor sequence
        cupHit = false;
        ballHit = false;
        endHit = false;
        j = i+1;
        if ( i == this.spotList.length-1 ) { endHit = true; };
        while (!cupHit && !ballHit && !endHit) {
          if ( this.spotList[j].hasBall && !this.spotList[j].hasCup ) {
            ballHit = true;
          } else if ( this.spotList[j].hasCup ) {
            cupHit = true;
          } else {
            if ( j != this.spotList.length-1 ) {
              j+=1;
            } else {
              endHit = true;
            }
          }
        }
        
        //this is a valid translation candidate
        if (cupHit) {
          validRight = true;
        }

        //candidacy
        if ( validLeft || validRight ) {
          let dirs = [validLeft,validRight];
          let transInfo = [i,dirs]
          validTranslationSpots.push(transInfo);
        }
      });

      this.translationSpotIndicies = validTranslationSpots;

      //state to console
      console.log(this);

    }

    //setup a swap between to cups
    singleSwap() {
      //find two spots that both contain cups
      let cups = [];
      //find a spot that has a cup, pick that cup
      //let choiceA = this.cupSpotIndicies[Math.floor(Math.random()*this.cupSpotIndicies.length)];
      let choiceA = this.biasedIndexPick(this.cupSpotIndicies,2);
      //find a spot that has a cup and not the previous spot

      let choiceB = this.biasedIndexPick(this.cupSpotIndicies,2);
      while ( choiceB == choiceA) {
        choiceB = this.biasedIndexPick(this.cupSpotIndicies,2);
      }

      //extract cups from the spots
      let cupASpot = spotList[choiceA];
      let cupBSpot = spotList[choiceB];

      //select swap speed
      let speed = this.pickSpeed();

      //clockwise ?
      let clockwise = (Math.random() > .5) ? false : true;

      //carry out the animation
      Monte.swap(cupASpot,cupBSpot,speed,clockwise);
    }

    doubleSwapTrivial() {
      //double swap outside outside | ( A B C D ) -> ( B A D C )
      let speed = this.pickSpeed();
      //trivial
      let clockwise = (Math.random() > .5) ? false : true;
      Monte.swap(this.spotList[this.cupSpotIndicies[0]],this.spotList[this.cupSpotIndicies[1]],speed,clockwise);
      clockwise = (Math.random() > .5) ? false : true;
      Monte.swap(this.spotList[this.cupSpotIndicies[2]],this.spotList[this.cupSpotIndicies[3]],speed,clockwise);
    }

    translate() {
      //pick an empty spot to be translated to 
      let choice = Math.floor(Math.random()*this.translationSpotIndicies.length);
      //what is the spot index?
      let spotIndex = this.translationSpotIndicies[choice][0];
      //which direction can we translate? 
      let dirs = this.translationSpotIndicies[choice][1];
      //pick a dir (if both are valid pick randomly
      let left = false;
      if ( dirs[0] == dirs[1] ) {
        left = (Math.random() >.5) ? false : true;
      } else {
        left = dirs[0];
      }
      let i = spotIndex;
      //find the closest cup to the left of the spot
      if ( left ) {
        let cupHit = false;
        while ( !cupHit ) {
          if ( this.spotList[i].hasCup ) {
            cupHit = true;
          } else {
            i--;
          }
        }
      }
      //find the closest cup to the right of the spot
      else {
        let cupHit = false;
        while ( !cupHit ) {
          if ( spotList[i].hasCup ) {
            cupHit = true;
          } else {
            i++;
          }
        }
      }
      //pick speed
      let speed = this.pickSpeed();
      //translate the cup to the spot
      Monte.translate(spotList[i],spotList[spotIndex],speed)
  } 

  arc() {

    //pick empty index
    let noCupChoice = this.noCupSpotIndicies[Math.floor(Math.random()*this.noCupSpotIndicies.length)];
    //pick a cup without a ball underneath it
    let cupChoice = this.cupSpotIndicies[Math.floor(Math.random()*this.cupSpotIndicies.length)];
    while ( this.spotList[cupChoice].hasBall ) {
      cupChoice = this.cupSpotIndicies[Math.floor(Math.random()*this.cupSpotIndicies.length)];
    }
    //pick speed
    let speed = this.pickSpeed();

    //spot and cup spot picked, perform arc
    Monte.arc(this.spotList[cupChoice],this.spotList[noCupChoice],speed);
  }
    

 /* 
  doubleSwapInOut() {
  console.log("double swap Out/In");
  //double swap outside inside  | ( A B C D ) -> ( D C B A )
  
  //trival

  let clockwise = (Math.random() > .5) ? false : true;
  Cup.swap(cupList[readyCupIndicies[0]],cupList[readyCupIndicies[3]],1,clockwise);
  clockwise = (Math.random() > .5) ? false : true;
  Cup.swap(cupList[readyCupIndicies[1]],cupList[readyCupIndicies[2]],1,clockwise);
}
*/

  //adjst the events list to reflect the valid events 
  //for this state
  qualify() {

    ////////////////////////// 
    // Reset Events Bag
    //////////////////////////
     
    this.events = ["wait"];

    //translation
    if ( this.translationSpotIndicies.length >= 1) {
      this.events.push("trans");
    }

    //arc
    if ( this.noCupSpotIndicies.length >= 1) {
      //this.events.push("arc");
    }

    //swap
    if ( this.cupSpotIndicies.length >= 2 ) {
      this.events.push("swap");


      //double swaps
      if (this.cupSpotIndicies.length >= 4) {
        this.events.push("2swapoo");
        //this.events.push("2swapoi);
      }
    }
  }


  ////////////////////////////
  // Dispatch Events
  ///////////////////////////

  dispatch () {

      // Update state
      this.update();
      
      // Determine Valid events
      this.qualify();

      // Pick an Event
      let e = this.events[Math.floor(Math.random()*this.events.length)];

      //log event
      this.eventTrace.push(e);

      //Waiting
      if ( e == "wait" ) {
      }

      //Swapping
      else if ( e == "swap" ) {
        this.singleSwap();
      } 

      // Double Swapping Outside Outside
      else if ( e == "2swapoo") {
        this.doubleSwapTrivial();
      }

      // Double Swapping Outside Inside
      
      // Translate
      else if ( e == "trans" ) {
        this.translate();
      } 
     
      //arc transition
      else if ( e == "arc" ) {
        this.arc();
      }
  }
}





  //Table
  let table = new Table();
  table.rotateX(-Math.PI/2);
  table.translateZ(0);

  //wall
 
  let wallGeometry = new THREE.PlaneGeometry(480, 120);
  let wallMaterial = new THREE.MeshLambertMaterial( { color : 0xffffff } );
  let wall = new THREE.Mesh( wallGeometry, wallMaterial );
  //back wall
  wall.position.z = - 60;
  wall.position.y = 15;
  scene.add(wall);

  let leftwall = new THREE.Mesh( wallGeometry, wallMaterial );
  leftwall.rotateY(Math.PI/2);
  leftwall.position.z = - 60;
  leftwall.position.y = 15;
  leftwall.position.x = -120;
  scene.add(leftwall);


  let rightwall = new THREE.Mesh( wallGeometry, wallMaterial );
  rightwall.rotateY(-Math.PI/2);
  rightwall.position.z = - 60;
  rightwall.position.y = 15;
  rightwall.position.x = 120;
  scene.add(rightwall);

  const gap = 20;

  ////////////////////
  // Generate Spots
  ////////////////////


  //how many cups
  let cupCount = 3;
  //how many free spaces?
  let blankCount = 0;


  let spotCount = cupCount + blankCount;
  let spotList = [];
  let spotCenterx = 0;

  let spotStartx = spotCenterx - Math.floor(spotCount/2)*gap;
  if (spotCount % 2 == 0) {
    spotStartx += gap/2;
  }
  for ( let i = 0; i < spotCount; i++ ) {

    let spotMaterial = new THREE.MeshLambertMaterial();
    spotMaterial.color = new THREE.Color("Gold");
    //let texture = new THREE.TextureLoader().load("img/irene-halloween.png");
    spotList.push(new Spot(spotStartx + gap*i)); 
  }


  
  //////////////////
  //Generate Cups
  /////////////////


  let cupColors = colors;
  let ballColors = colors;

  //color cups for debug purpose
  let uniform = true;
 
  let pickedSpots = []; 

  //place cups until cupCount Cups are on the board
  while (pickedSpots.length != cupCount) {
    //pick a spot not already choosen
    let choice = Math.floor(Math.random()*spotCount);
    while (pickedSpots.includes(choice)) {
      choice = Math.floor(Math.random()*spotCount);
    }
    pickedSpots.push(choice);

    //cup material
    let mat = new THREE.MeshLambertMaterial();
    //colorful or uniform
    if (!uniform) {
      let ran = Math.floor(Math.random()*cupColors.length);
      //remove color froms colors
      mat.color = new THREE.Color(cupColors[ran]);
      cupColors.splice(ran,1);
    } else {
      mat.color = new THREE.Color("Gold");
    }
    //create cup and add it to the list
    let newCup = new Cup(spotList[choice].position.x,choice); 
    spotList[choice].addCup(newCup);

  }


  /////////////
  //balls
  /////////////

  /*
  const ball1 = new THREE.Mesh( ballGeometry , ballMaterial );
  scene.add ( ball1 );
  */

  let ballCount = 1;
  //place balls
  let used = [];
  for ( let i = 0; i < ballCount; i++) {
    let ballIndex = Math.floor(Math.random()*spotList.length);
    while (used.includes(ballIndex) || spotList[ballIndex].hasCup != true || spotList[ballIndex].hasBall == true) {
      ballIndex = Math.floor(Math.random()*spotList.length);
    }

    //pick ball color
    let ran = Math.floor(Math.random()*ballColors.length);
    //remove color froms colors
    ballColors.splice(ran,1);

    let ball = new Ball( ballColors[ran] );
    ball.position.y = 3; //kinda spaghetti gets overriden by cup code i think
    //attatch to cup
    Monte.addBall(spotList[ballIndex].cup,ball);
    spotList[ballIndex].addBall(ball);
    used.push(ballIndex);
  }



  /////////////////
  //Orient camera
  /////////////////

	//bring the camera out above to make an isometric view
  //forward up view
	camera.position.z = 100; //positive is outward , towards me
  camera.position.y = 50;

  //top down view
  //camera.position.x = 0;
  //camera.position.z = 0;
  //camera.position.y = 50;

  //side view
  /*
  camera.position.x = 300;
  camera.position.y = -10;
  */

  camera.lookAt(0,0,0);

  ////////////////////////////////////
  // Simulation State and Management
  ////////////////////////////////////

  let mix = false;

  let lastTime = new Date();
  let p = .70;
  let delay = 400;//1 sec

  let eventCount = 0;
  let maxEvents = 15;

  //Grab event counter from the dom
  let eventCounter = document.getElementById("event-counter");
  let instructionText = document.getElementById("instructionText");

  let state = "preamble";
  let preStep = 0;

  let postStep = 0;
  let userReveal = true;
  let playAgain = false;

  //must be factors of 60 (fps target)
	//let speedBag = [.25,.25,(1/6),(1/6),(1/6),(1/5),(1/5),(1/10)];
	let speedBag = [.25,1.5,1,1,1,.1/6];
  let eventDispatcher = new EventDispatcher(spotList,speedBag);

  //listen for reveal key press
	document.addEventListener("keydown", onDocumentKeyDown, false);

	function onDocumentKeyDown(event) {
			var keyCode = event.which;
			if (keyCode == 32) {
        if ( state == "preamble") {
          userReveal = false;
        } else if ( state == "done" ) {
          if ( postStep == 1 ) {
            userReveal = true;
          } else if (postStep == 2 && checkSpotsReady()) {
              playAgain = true;
              state = "preamble";
              eventCount = 0;
              userReveal = false;
              preStep = 2;
              postStep = 0;
          }
        }
      } 			 	
  };


  function checkSpotsReady() {
    //Are all spots done animating?
    let value = true;
    for ( let i = 0; i < spotList.length; i++) {
      value  = value && spotList[i].ready();
    }
    return value;
  }


	//Animation loop
	function animate() {
    requestAnimationFrame( animate );

    /////////////////////////
    // Update Event Counter
    // //////////////////////
    eventCounter.innerText = eventCount;

      
    ////////////////////////////
    // Pre - Game
    ///////////////////////////

    if (state == 'preamble') {

      //reveal cups
      if (preStep == 0 && checkSpotsReady()) {
 
        spotList.forEach( spot => {
          if (spot.hasCup) {
          Monte.reveal(spot.cup);
          }
        });

        preStep = 1;
      } else if (preStep == 1 && checkSpotsReady()) {

        instructionText.innerHTML = "Press Space To Begin";
        preStep = 2;

      //hide cups when animation is done and user says so @userHide
      } else if (preStep == 2 && !userReveal) {

        instructionText.innerHTML = "";
        spotList.forEach( spot => {
          if ( spot.hasCup == true ) {
            Monte.hide(spot.cup)
          }
        });

        preStep = 3;
      } else if (preStep == 3 && checkSpotsReady()) {
        state = "shuffle";
        preStep = 0;
      }

    } else if (state == "shuffle") {

    if (checkSpotsReady() && eventCount < maxEvents) {
      //generate an event
      eventDispatcher.dispatch();
      eventCount++;
      if (eventCount == maxEvents) {
        state = "done";
        }
    }

    //If the pregame is over and we have ran out of events and the user
    // has triggered userReveal by pressing spacedo the following
    } else if ( state == "done") {

      //wait until the cups are done animating to inform user
      //that they can lift cups
      if ( postStep == 0 && checkSpotsReady())  {
        //inform user
        instructionText.innerHTML = "Press Space To Reveal";
        postStep = 1;
      }

      //if user requested cup lift ...
      else if (postStep == 1 && userReveal) {
        instructionText.innerHTML = "";
        spotList.forEach( spot => {
          if (spot.hasCup) {
            Monte.reveal(spot.cup);
          }
        });
        postStep = 2;
      } else if (postStep == 2 && checkSpotsReady()) {
        instructionText.innerHTML = "Press Space to play again";
      }
    } 


    /////////////////////////////
    // Update Spots , Cups, Balls
    /////////////////////////////

    spotList.forEach( spot => {
      spot.update();
    });

    
		renderer.render( scene, camera );
	}

animate();




