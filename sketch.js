/**
 *  @author Cody
 *  @date 2025.01.06
 *  earliest mechanic: Utopian Sky from FRU P1
 *  latest mechanic: Diamond Dust from FRU P2 (in-progress)
 *  Some encapsulations might not be included in certain places, making the code
 *   messier than it can be.
 */

/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.visible = true
        this.size = lines
        this.debugMsgList = [] /* initialize all elements to empty string */
        for (let i in lines)
            this.debugMsgList[i] = ''
    }

    setText(text, index) {
        if (index >= this.size) {
            this.debugMsgList[0] = `${index} ← index>${this.size} not supported`
        } else this.debugMsgList[index] = text
    }

    showBottom() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 7*scalingFactor)

            const LEFT_MARGIN = 10
            const DEBUG_Y_OFFSET = height - 10 /* floor of debug corner */
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */
            rect(
                0,
                height,
                width,
                DEBUG_Y_OFFSET - LINE_HEIGHT * this.debugMsgList.length - TOP_PADDING
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            for (let index in this.debugMsgList) {
                const msg = this.debugMsgList[index]
                text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
            }
        }
    }

    showTop() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 7*scalingFactor)

            const LEFT_MARGIN = 10
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */

            /* offset from top of canvas */
            const DEBUG_Y_OFFSET = textAscent() + TOP_PADDING
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background, a console-like feel */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)

            rect( /* x, y, w, h */
                0,
                0,
                width,
                DEBUG_Y_OFFSET + LINE_HEIGHT*this.debugMsgList.length/*-TOP_PADDING*/
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            textAlign(LEFT)
            for (let i in this.debugMsgList) {
                const msg = this.debugMsgList[i]
                text(msg, LEFT_MARGIN, LINE_HEIGHT*i + DEBUG_Y_OFFSET)
            }
        }
    }
}

/* arriving 2D variable. Caution: modes may be difficult to use. Different
modes:
  Faster at Intercards (default): Moves in cardinal directions
   independently, resulting in possibly curved lines.
  Straight Line: Moves directly in a straight line.
  Ice: Basically the same as Straight Line, except you move slightly more randomly.
  Radial: Moves in radius and angle independently, resulting in possibly curved lines.
    Designed for no radius changes.
    Significantly faster when further away from center.
*/
class ArrivingVector {
    constructor(x, y, targetX, targetY, speed, slowdown) {
        this.x = x;
        this.y = y;
        this.targetX = targetX
        this.targetY = targetY
        this.speed = speed
        this.slowdown = slowdown
        this.mode = defaultMovementMode
    }

    // update x and y.
    update() {
        let angleBetween
        let distanceBetween
        switch (this.mode) {
            case "Faster at Intercards":
                if (this.x > this.targetX) {
                    let diffX = this.x - this.targetX
                    this.x -= map(diffX, 0, this.slowdown, 0, this.speed, true)
                } if (this.x < this.targetX) { // simply reverse the code earlier
                let diffX = this.targetX - this.x
                this.x += map(diffX, 0, this.slowdown, 0, this.speed, true)
            }
                if (this.y > this.targetY) {
                    let diffY = this.y - this.targetY
                    this.y -= map(diffY, 0, this.slowdown, 0, this.speed, true)
                } if (this.y < this.targetY) { // simply reverse the code earlier
                let diffY = this.targetY - this.y
                this.y += map(diffY, 0, this.slowdown, 0, this.speed, true)
            }
                break
            case "Straight Line":
                // figure out the angle and distance, and move that direction
                angleBetween = atan2(this.targetY - this.y, this.targetX - this.x)
                distanceBetween = sqrt((this.targetY - this.y)**2 + (this.targetX - this.x)**2)
                this.x += cos(angleBetween)*map(distanceBetween, 0, this.slowdown, 0, this.speed, true)
                this.y += sin(angleBetween)*map(distanceBetween, 0, this.slowdown, 0, this.speed, true)
                break
            case "Ice":
                // figure out the angle and distance, and move that direction
                angleBetween = atan2(this.targetY - this.y, this.targetX - this.x)
                distanceBetween = sqrt((this.targetY - this.y)**2 + (this.targetX - this.x)**2)
                this.x += cos(angleBetween)*map(distanceBetween, 0, this.slowdown, 0, (this.speed + sin(frameCount/10)*this.speed/4)*2, true)
                this.y += sin(angleBetween)*map(distanceBetween, 0, this.slowdown, 0, (this.speed + sin(frameCount/10)*this.speed/4)*2, true)
                break
            case "Radial":
                let currentAngle = atan2(this.y, this.x)
                let currentDistance = sqrt(this.y**2 + this.x**2)
                let targetAngle = atan2(this.targetY, this.targetX)
                let targetDistance = sqrt(this.targetY**2 + this.targetX**2)
                let angleDiff = (targetAngle - currentAngle + PI*3) % TWO_PI - PI
                let distanceDiff = targetDistance - currentDistance
                let nextAngle = currentAngle + map(angleDiff, -radians(this.slowdown/scalingFactor), radians(this.slowdown/scalingFactor), -radians(this.speed/scalingFactor)/2, radians(this.speed/scalingFactor)/2, true)
                let nextDistance = currentDistance + map(distanceDiff, -this.slowdown, this.slowdown, -this.speed, this.speed, true)
                // console.log("Current xy:", this.y, this.x)
                // console.log("Target xy:", this.targetY, this.targetX)
                // console.log("Current ad:", currentAngle, currentDistance)
                // console.log("Target ad:", targetAngle, targetDistance)
                // console.log("Diff ad:", angleDiff, distanceDiff)
                // console.log("Diff from next ad:", map(angleDiff, -radians(this.slowdown), radians(this.slowdown), -radians(this.speed), radians(this.speed), true), map(distanceDiff, -this.slowdown, this.slowdown, -this.speed, this.speed, true))
                // console.log("Next ad:", nextAngle, nextDistance)
                // console.log("———————————————")
                this.x = cos(nextAngle)*nextDistance
                this.y = sin(nextAngle)*nextDistance
                break
        }
    }
}

//————————————————————————————initialize variables————————————————————————————\\
let cnv // in case we want to update more later
let defaultMovementMode = "Straight Line"

// initial variables from template
let font
let fixedWidthFont
let variableWidthFont
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */

// displaying the windows
let baseScalingFactor = 1.5
let scalingFactor = 1
let scalingFactorFetch = localStorage.getItem("scalingFactor")
if (!scalingFactorFetch) {
    localStorage.setItem("scalingFactor", "1")
    scalingFactorFetch = "1"
}
scalingFactor = baseScalingFactor*parseFloat(scalingFactorFetch)
scalingFactorFetch = parseFloat(scalingFactorFetch)

let textPadding = 3.5*scalingFactor
let topSquareSize = 50*scalingFactor // the size of the top corner squares
let topWidth = 250*scalingFactor  // the width of the window at the top, not including the top corner squares
let mechanicSelectionRows = 5 // the number of rows in "mechanic selection"
let mechanicSelectionHeight = mechanicSelectionRows*13*scalingFactor + textPadding*2
let middleTopHeight = 60*scalingFactor // the height of the window just above the main body
let bottomHeight = 50*scalingFactor // the height of the window at the bottom
let holeSize = 10*scalingFactor
let cornerRounding = 5*scalingFactor
let mainBodyHeight = topSquareSize*2 + holeSize*4 + topWidth // the height of the main window. since the main window has to be square, a different calculation is used.
let scalingAdjustHeight = 50*scalingFactor
let windowWidth = topSquareSize*2 + holeSize*2 + topWidth
let mainBodyWidth = windowWidth + holeSize*2
let middleTopWidth = windowWidth
let bottomWidth = windowWidth
let selectionWidth = windowWidth
let scalingAdjustWidth = windowWidth
let mousePressedLastFrame = false // used sometimes

// used in initialization of mechanics. also a great thing for me to refer
// back to for version changes
let updates = `<strong>Updates</strong>:
+
+Add version updates—crucial if changes are made to local storage processes, I don't want to erase all your streaks, wins, and losses
+Add Silence/Stillness
+Add puddle-dropping phase (no puddles included)
+Add time tracker
+Add win/loss, streak, purge data, & coin tracking
+Make character paths straight lines
+<strong>First half of Diamond Dust</strong>
+Scaling factor adjust window
+Smoother character position changes
+<strong>FRU P2 background & Diamond Dust setup</strong>
+Background image through CSS
+Customization through code
+Resizing through code
+<strong>Utopian Sky</strong>
<strong>Initialization</strong>
    
<strong>Future updates</strong>:
KUDOS 🎉 (for a certain number streak, a certain number of total wins, a certain amount of time, or a high score on time)
Mobile-compatible version? Not sure
Make default text bigger
Customization of window positions from the user. +local storage
More currencies! But you've got to spend them somehow...although the dopamine hit is nice. 😉
`

// your role
let role = "MT"

// positions: used for displaying (relative to center of arena)
let MT = [0, 0]
let OT = [0, 0]
let H1 = [0, 0]
let H2 = [0, 0]
let M1 = [0, 0]
let M2 = [0, 0]
let R1 = [0, 0]
let R2 = [0, 0]
let realMT = new ArrivingVector(MT[0], MT[1], MT[0], MT[1], scalingFactor, 20*scalingFactor)
let realOT = new ArrivingVector(OT[0], OT[1], OT[0], OT[1], scalingFactor, 20*scalingFactor)
let realH1 = new ArrivingVector(H1[0], H1[1], H1[0], H1[1], scalingFactor, 20*scalingFactor)
let realH2 = new ArrivingVector(H2[0], H2[1], H2[0], H2[1], scalingFactor, 20*scalingFactor)
let realM1 = new ArrivingVector(M1[0], M1[1], M1[0], M1[1], scalingFactor, 20*scalingFactor)
let realM2 = new ArrivingVector(M2[0], M2[1], M2[0], M2[1], scalingFactor, 20*scalingFactor)
let realR1 = new ArrivingVector(R1[0], R1[1], R1[0], R1[1], scalingFactor, 20*scalingFactor)
let realR2 = new ArrivingVector(R2[0], R2[1], R2[0], R2[1], scalingFactor, 20*scalingFactor)

// window positions
let greenSquareX = 0
let greenSquareY = 0
let redSquareX = 0
let redSquareY = 0
let topWindowX = 0
let topWindowY = 0
let selectionX = 0
let selectionY = 0
let middleTopX = 0
let middleTopY = 0
let mainBodyX = 0
let mainBodyY = 0
let bottomWindowX = 0
let bottomWindowY = 0
let scalingAdjustX = 0
let scalingAdjustY = 0

// Utopian Sky (FRU P1)
let fruP1Image
let utopianSkyFog
let unsafeClones
let spreadOrStack
let safeDirections

// Diamond Dust (FRU P2)
let fruP2Image
let fruP2IceFloor
let firstCircles
let secondCircles
let thirdCircles
let fourthCircles
let markedPlayers
let silenceOrStillness
let inOrOut
let ice
let spawnAngle
let puddles

// Mirror Mirror (FRU P2)
let mirror
let redMirror
let blueMirrorAngle
let redMirrorConfig
let redMirrorAngleOne
let redMirrorAngleTwo

// Wingmark (M6S)
let m6sP1Image
let m6sP1Bomb
let m6sP1WingedBomb
let m6sP1Morbol
let m6sP1Succubus


// Millennial Decay (M8S P1)
let gustImage // spreads
let m8sP1Image
let m8sP1Background
let m8sP1WolfHead
let m8sP1LineAoE
let dpsOrSupportsFirst // who gets targetted first for spreads
let wolfHeadRotation // whether the wolf heads will rotate dcw or ccw. follow rotation
let northOrSouth // wolf heads can spawn north or south. purely graphical
let framesWhenKnockbackStarted // for graphical effects
let actualWolfHeadRotation // The other one is reversed, but I'm too lazy to change it

// other variables
let currentlySelectedMechanic = "Utopian Sky"
let currentlySelectedBackground = "FRU P1"
let stage = 0 // the current step you're on. always defaults to 0
let mechanicStarted = 0
let textAtTop
let textAtBottom
let centerOfBoard
let numWinsPerCoinIncrease = 1 // number of wins per 1 coin increase

// sometimes the code will change and require a system update like a local storage rename.
let version = "0.000"
// Version 0.000
//  - Initial release
//  - FRU support for Utopian Sky (do not use), Diamond Dust, Mirror Mirror
//    - nothing changed to support these
//  - Currency coin tracking via local storage
//  - Time tracking without local storage

// Version 0.100
//  - Updates implemented
//  - M8S support for Millennial Decay
//    - nothing changed to support these

// version format:
//  first number: expansion number
//  first number after decimal: tier implementation number, starts at 0
//  second number after decimal: 0 = main, 1-9 = more fights
//  third number after decimal: 0 = main, 1-9 = mechanic


//——————————————————————————your everyday functions——————————————————————————\\

function preload() {
    font = loadFont('data/meiryo.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')
}


function setup() {
    let bonusWidth = 200*scalingFactor
    cnv = createCanvas(topSquareSize*2 + holeSize*4 + topWidth + bonusWidth,
        topSquareSize + mechanicSelectionHeight + middleTopHeight + mainBodyHeight + bottomHeight + scalingAdjustHeight + holeSize*7)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 7*scalingFactor)

    // by the time I realized I was using "rectMode(CORNERS)" I was too lazy
    // to change everything back
    rectMode(CORNERS)

    // I prefer this mode, although I almost never input something into the
    // fourth or fifth parameters anyway
    imageMode(CORNER)

    // just making sure nothing goes wrong
    angleMode(RADIANS)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)
    debugCorner.visible = false

    setupDiamondDust()

    // there is a padding of holeSize on the sides. To remove this padding,
    // subtract holeSize from greenSquareX, greenSquareY, redSquareY, topWindowX,
    // topWindowY, middleTopX, mainBodyX, bottomWindowX, and selectionX; add holeSize
    // to redSquareX; and remove holeSize*2 from the width and height.

    // there is a padding of bonusWidth/2 on the left and right. To remove
    // this padding, remove all instances of bonusWidth and bonusWidth/2.
    // to add back the padding, add bonusWidth to the width, initialize
    // bonusWidth as 200*scalingFactor, and add bonusWidth/2 to
    // greenSquareX, topWindowX, middleTopX, mainBodyX, bottomWindowX,
    // selectionX, and scalingAdjustX. Also subtract bonusWidth/2 from
    // redSquareX.

    greenSquareX = holeSize + bonusWidth/2
    greenSquareY = holeSize
    redSquareX = width - topSquareSize - holeSize - bonusWidth/2
    redSquareY = holeSize
    topWindowX = topSquareSize + holeSize*2 + bonusWidth/2
    topWindowY = holeSize
    middleTopX = holeSize + bonusWidth/2
    middleTopY = topWindowY + topSquareSize + holeSize
    mainBodyX = bonusWidth/2
    mainBodyY = middleTopY + middleTopHeight + holeSize
    bottomWindowX = holeSize + bonusWidth/2
    bottomWindowY = mainBodyY + mainBodyHeight + holeSize
    selectionX = holeSize + bonusWidth/2
    selectionY = bottomWindowY + bottomHeight + holeSize
    scalingAdjustX = holeSize + bonusWidth/2
    scalingAdjustY = selectionY + mechanicSelectionHeight + holeSize

    // greenSquareX = 0
    // greenSquareY = 0
    // redSquareX = width - topSquareSize
    // redSquareY = 0
    // topWindowX = topSquareSize + holeSize
    // topWindowY = 0
    // middleTopX = 0
    // middleTopY = topWindowY + topSquareSize + holeSize
    // mainBodyX = 0
    // mainBodyY = middleTopY + middleTopHeight + holeSize
    // bottomWindowX = 0
    // bottomWindowY = mainBodyY + mainBodyHeight + holeSize
    // selectionX = 0
    // selectionY = bottomWindowY + bottomHeight + holeSize

    centerOfBoard = [mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2]

    textAlign(CENTER, CENTER)

    if (parseInt(localStorage.getItem("coins")) > 9) {
        let link = document.getElementById('coin')
        let newFavicon = 'data/Gold Coin Bag.ico'
        let timestamp = new Date().getTime()
        link.href = `${newFavicon}?${timestamp}`
    } if (parseInt(localStorage.getItem("coins")) > 249) {
        let link = document.getElementById('coin')
        let newFavicon = 'data/Gold Coin Medium Bag.ico'
        let timestamp = new Date().getTime()
        link.href = `${newFavicon}?${timestamp}`
    } if (parseInt(localStorage.getItem("coins")) > 499) {
        let link = document.getElementById('coin')
        let newFavicon = 'data/Gold Coin Large Bag.ico'
        let timestamp = new Date().getTime()
        link.href = `${newFavicon}?${timestamp}`
    } if (parseInt(localStorage.getItem("coins")) > 999) {
        let link = document.getElementById('coin')
        let newFavicon = 'data/Gold Coin Giant Heap.ico'
        let timestamp = new Date().getTime()
        link.href = `${newFavicon}?${timestamp}`
    }

    if (localStorage.getItem("version")) {
        version = localStorage.getItem("version")
    }

    // make sure your version is up-to-date and do any updates required
    switch (version) {
            case "0.000":
                version = "0.100"
                break
            default:
                print("Your version is up to date")
        }
    while (true) {
        let uptodate = false
        switch (version) {
            case "0.000":
                version = "0.100"
                break
            default:
                uptodate = true
        }
        if (uptodate) break
    }
    localStorage.setItem("version", version)
}

function draw() {
    frameRate(1000)
    updateVectors()

    // the green square at the top-left TODO
    fill(120, 80, 50)
    noStroke()
    rect(greenSquareX, greenSquareY, greenSquareX + topSquareSize, greenSquareY + topSquareSize, cornerRounding)
    displayWinContent()

    // the top window
    fill(234, 34, 24)
    noStroke()
    rect(topWindowX, topWindowY, topWindowX + topWidth, topWindowY + topSquareSize, cornerRounding)
    displayTopWindowContent()

    // the red square at the top-right TODO
    fill(350, 80, 50)
    noStroke()
    rect(redSquareX, redSquareY, redSquareX + topSquareSize, redSquareY + topSquareSize, cornerRounding)
    displayLossContent()

    // the main body window.
    fill(234, 34, 24, 0.5)
    noStroke()
    // rect(mainBodyX, mainBodyY, mainBodyX + mainBodyWidth, mainBodyY + mainBodyHeight, cornerRounding)
    displayMainBodyContent()

    // the mechanic section window
    fill(234, 34, 24)
    noStroke()
    rect(selectionX, selectionY, selectionX + selectionWidth, selectionY + mechanicSelectionHeight, cornerRounding)
    displayMechanicSelection()

    // the middle-top window
    fill(234, 34, 24)
    noStroke()
    rect(middleTopX, middleTopY, middleTopX + middleTopWidth, middleTopY + middleTopHeight, cornerRounding)
    textAlign(LEFT, TOP)
    displayMiddleTopWindowContent()

    // the bottom window
    fill(234, 34, 24)
    noStroke()
    rect(bottomWindowX, bottomWindowY, bottomWindowX + bottomWidth, bottomWindowY + bottomHeight, cornerRounding)
    displayBottomWindowContent()

    // the scaling adjustment window
    fill(234, 34, 24)
    noStroke()
    rect(scalingAdjustX, scalingAdjustY, scalingAdjustX + scalingAdjustWidth, scalingAdjustY + scalingAdjustHeight, cornerRounding)
    displayScalingAdjustContent()

    // used in emergencies. also a nice treat for those who accidentally
    // pressed backtick
    displayDebugCorner()

    // make sure mousePressedLastFrame is updated
    mousePressedLastFrame = mouseIsPressed
}

//——————————————————————————display window contents——————————————————————————\\

function displayWinContent() {
    let wins = parseInt(localStorage.getItem(currentlySelectedMechanic + " wins"))
    let streak = parseInt(localStorage.getItem(currentlySelectedMechanic + " streak"))
    let coins = parseInt(localStorage.getItem("coins"))
    if (isNaN(wins)) {
        localStorage.setItem(currentlySelectedMechanic + " wins", "0")
    }
    if (isNaN(streak)) {
        localStorage.setItem(currentlySelectedMechanic + " streak", "0")
    }
    if (isNaN(coins)) {
        localStorage.setItem("coins", "0")
    }

    // display in the form of:
    // 🟩🟩🟩🟩🟩🟩🟩🟩
    // 🟩              🟩
    // 🟩     WINS     🟩
    // 🟩      20      🟩
    // 🟩  STREAK: 0   🟩
    // 🟩  COINS: 0    🟩
    // 🟩              🟩
    // 🟩🟩🟩🟩🟩🟩🟩🟩
    // ...or something like that. lol
    fill(0, 0, 100)
    noStroke()
    textAlign(CENTER, CENTER)
    textSize(12*scalingFactor)
    text("WINS", greenSquareX + topSquareSize/2, greenSquareY + topSquareSize/4)
    textSize(7*scalingFactor)
    text("\n" + wins + "\nSTREAK: " + streak + "\nCOINS: " + coins, +
        greenSquareX + topSquareSize/2, +
        greenSquareY + 7*topSquareSize/12)
}

function displayLossContent() {
    let wipes = parseInt(localStorage.getItem(currentlySelectedMechanic + " wipes"))
    if (isNaN(wipes)) {
        localStorage.setItem(currentlySelectedMechanic + " wipes", "0")
    }

    // display in the form of:
    // 🟥🟥🟥🟥🟥🟥🟥🟥
    // 🟥              🟥
    // 🟥    WIPES     🟥
    // 🟥      0       🟥
    // 🟥              🟥
    // 🟥              🟥
    // 🟥              🟥
    // 🟥🟥🟥🟥🟥🟥🟥🟥
    // ...or something like that. lol
    // *brags about how he's had situations like these many times in the
    // past*

    fill(0, 0, 100)
    noStroke()
    textAlign(CENTER, CENTER)
    textSize(12*scalingFactor)
    text("WIPES", redSquareX + topSquareSize/2, redSquareY + topSquareSize/5)
    textSize(7*scalingFactor)
    text(wipes/* + "\nSTREAK\nCOINS: " + coins*/ + "\n\n", redSquareX +
        topSquareSize/2, redSquareY + 7*topSquareSize/12)

}

function displayTopWindowContent() {
    textAlign(LEFT, BASELINE)
    noStroke()

    // make buttons look like buttons
    fill(120, 50, 50)
    rect(topWindowX, topWindowY + textAscent()*3 + textDescent()*3 + textPadding,
        topWindowX + topWidth/3, topWindowY + topSquareSize, cornerRounding)
    fill(0, 100, 50)
    rect(topWindowX + topWidth/3, topWindowY + textAscent()*3 + textDescent()*3 + textPadding,
        topWindowX + topWidth*2/3, topWindowY + topSquareSize, cornerRounding)
    fill(240, 50, 50)
    rect(topWindowX + topWidth*2/3, topWindowY + textAscent()*3 + textDescent()*3 + textPadding,
        topWindowX + topWidth, topWindowY + topSquareSize, cornerRounding)


    fill(0, 0, 100)
    text("Hi! I'm trying to make simulations for various mechanics." +
        "\nI'll try not to delete any mechanic implementations if someone" +
        "\nwants them again. Earliest mechanic: Utopian Sky from FRU." +
        "\n\n    Reset mechanic                Purge data            Change" +
        " role from " + role,
        topWindowX + textPadding, topWindowY + textPadding + textAscent())



    // since the buttons at the bottom are useful, just...make them useful XD
    if (mouseY < topWindowY + topSquareSize && mouseY > topWindowY + textAscent()*3 + textDescent()*3 + textPadding) {
        fill(0, 0, 0, 30)

        if (mouseX > topWindowX && mouseX < topWindowX + topWidth/3) {
            rect(topWindowX, topWindowY + textAscent() * 3 + textDescent() * 3 + textPadding, topWindowX + topWidth / 3, topWindowY + topSquareSize, cornerRounding)

            if (mouseIsPressed) {
                // so long as the mouse wasn't held down, reset the mechanic
                if (!mousePressedLastFrame) {
                    reset()
                }
            }
            return
        }

        if (mouseX > topWindowX + topWidth/3 && mouseX < topWindowX + 2*topWidth/3) {
            rect(topWindowX + topWidth/3, topWindowY + textAscent() * 3 + textDescent() * 3 + textPadding, topWindowX + 2*topWidth/3, topWindowY + topSquareSize, cornerRounding)
            if (mousePressedButNotHeldDown()) {
                localStorage.setItem(currentlySelectedMechanic + " wins", "0")
                localStorage.setItem(currentlySelectedMechanic + " wipes", "0")
                localStorage.setItem(currentlySelectedMechanic + " streak", "0")
                return
            }
        }

        if (mouseX > topWindowX + 2*topWidth/3 && mouseX < topWindowX + topWidth) {
            rect(topWindowX + 2*topWidth/3, topWindowY + textAscent()*3 + textDescent()*3 + textPadding, topWindowX + topWidth, topWindowY + topSquareSize, cornerRounding)
            if (mouseIsPressed) {
                // so long as the mouse wasn't held down, change roles
                if (!mousePressedLastFrame) {
                    switch (role) {
                        case "MT":
                            role = "OT"
                            break
                        case "OT":
                            role = "H1"
                            break
                        case "H1":
                            role = "H2"
                            break
                        case "H2":
                            role = "M1"
                            break
                        case "M1":
                            role = "M2"
                            break
                        case "M2":
                            role = "R1"
                            break
                        case "R1":
                            role = "R2"
                            break
                        case "R2":
                            role = "MT"
                            break
                    }
                    // you can't cheat by switching roles mid-mech!
                    reset()
                    return
                }
            }
        }
    }
    textAlign(CENTER, CENTER)
}

function displayMiddleTopWindowContent() {
    fill(0, 0, 100)
    text(textAtTop, middleTopX + textPadding, middleTopY + textPadding)

    // display how long it's been since the mechanic started
    fill(0, 0, 100)
    noStroke()
    textSize(7*scalingFactor)
    textAlign(LEFT, TOP)
    text("It's been " + formatSeconds((millis() - mechanicStarted)/1000) + " since" +
        " the mechanic started.", middleTopX + textPadding, middleTopY + middleTopHeight -
        textPadding - textAscent() - textDescent())
}

function displayMainBodyContent() {
    push()
    translateToCenterOfBoard()
    let rotation = 0

    // Futures Rewritten Ultimate phase 1 background
    if (currentlySelectedBackground === "FRU P1") {
        // background image (it's slightly tilted, I don't know why, but
        // this rotation should help)
        push()
        rotate(0.02)
        tint(0, 0, 100, 10)
        image(fruP1Image, -mainBodyWidth/2 + 20*scalingFactor, -mainBodyWidth/2 + 20*scalingFactor,
            mainBodyWidth - 40*scalingFactor, mainBodyWidth - 40*scalingFactor)
        pop()


        // death wall
        noStroke()
        fill(240, 100, 50, 10)
        beginShape()
        for (let i = 0; i < TWO_PI; i += TWO_PI / 500) {
            vertex(cos(i) * mainBodyWidth / 2,
                sin(i) * mainBodyWidth / 2)
        }
        beginContour()
        for (let i = TWO_PI; i > 0; i -= TWO_PI / 500) {
            vertex(cos(i) * (mainBodyWidth / 2 - 20*scalingFactor),
                sin(i) * (mainBodyWidth / 2 - 20*scalingFactor))
        }
        endContour()
        endShape(CLOSE)


        // notches
        noStroke()
        fill(0, 0, 100)
        for (let i = 0; i < TWO_PI; i += TWO_PI / 72) {
            circle(cos(i) * (mainBodyWidth / 2 - 15*scalingFactor),
                sin(i) * (mainBodyWidth / 2 - 15*scalingFactor), 3*scalingFactor)
        }

        // big notches on cardinals and intercardinals
        fill(120, 100, 50)
        for (let i = 0; i < TWO_PI; i += TWO_PI / 8) {
            circle(cos(i) * (mainBodyWidth / 2 - 15*scalingFactor),
                sin(i) * (mainBodyWidth / 2 - 15*scalingFactor), 7*scalingFactor)
        }

        displayCharacterPositions()

        pop()

        // Utopian Sky
        if (currentlySelectedMechanic === "Utopian Sky") {
            // stage 0: mechanic inactive
            if (stage === 0) {
                displayGreenDot(0, 0)

                if (spreadOrStack === "spread") stroke(240, 50, 100)
                if (spreadOrStack === "stack") stroke(0, 50, 100)
                displayFatebreaker([0, -mainBodyWidth/4], false)

                // clicking on the green dot will advance to the next stage
                if (mousePressedButNotHeldDown()) {
                    if (sqrt((mouseX - (mainBodyX + mainBodyWidth/2))**2 +
                        (mouseY - (mainBodyY + mainBodyHeight/2))**2) < 10*scalingFactor) {
                        stage = 1

                        // the distance everyone will go to get to their clock
                        // spots
                        let spreadRadius = mainBodyWidth*3/7

                        MT = [spreadRadius/15, -spreadRadius]
                        OT = [spreadRadius*0.707, -spreadRadius*0.757]
                        R2 = [spreadRadius, 0]
                        M2 = [spreadRadius*0.707, spreadRadius*0.707]
                        H2 = [0, spreadRadius]
                        M1 = [-spreadRadius*0.707, spreadRadius*0.707]
                        H1 = [-spreadRadius, 0]
                        R1 = [-spreadRadius*0.707, -spreadRadius*0.707]
                        MT = [0, -spreadRadius]
                        OT = [spreadRadius*0.707, -spreadRadius*0.707]

                        textAtTop = "You just went to your clock spot. Run" +
                            " in or stay where you are. \n" +
                            "Since your partners haven't moved yet, if your" +
                            " clone has a lowered arm, don't move. Yet.\n\n" +
                            "Clones actually appear at the edge of the" +
                            " arena in-game."
                        textAtBottom = "You went to your clock" +
                            " spot.\n[PASS] — You remembered whether it was" +
                            " stack or spread...right? Well, now it's foggy," +
                            " so you can't \ntell anymore."

                        // make the arena foggy
                        erase()
                        rect(0, 0, width, height)
                        noErase()
                        let css = select("body")
                        css.style("background-image",
                            "url(\"data/fogGrain3.jpg\")")
                        // background(0, 0, 100)
                        // for (let j = 0; j < 20; j += 1) {
                        //     fill(0, 0, 60, 20)
                        //     noStroke()
                        //     for (let i = 0; i < height; i += 2*scalingFactor) {
                        //         circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 25*scalingFactor, i / 50 + 50*scalingFactor))
                        //         circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 25*scalingFactor, i / 50 + 50*scalingFactor))
                        //         circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 25*scalingFactor, i / 50 + 50*scalingFactor))
                        //     }
                        //     fill(0, 0, 70, 20)
                        //     for (let i = 0; i < height; i += 2*scalingFactor) {
                        //         rect(random(0, width*2/3), random(i, i + 10*scalingFactor), random(width/3, width), random(i + 40*scalingFactor, i + 50*scalingFactor))
                        //         rect(random(0, width*2/3), random(i, i + 10*scalingFactor), random(width/3, width), random(i + 40*scalingFactor, i + 50*scalingFactor))
                        //         rect(random(0, width*2/3), random(i, i + 10*scalingFactor), random(width/3, width), random(i + 40*scalingFactor, i + 50*scalingFactor))
                        //     }
                        //     fill(0, 0, 90, 20)
                        //     for (let i = 0; i < height; i += 2*scalingFactor) {
                        //         circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 10*scalingFactor, i / 50 + 30*scalingFactor))
                        //         circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 10*scalingFactor, i / 50 + 30*scalingFactor))
                        //         circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 10*scalingFactor, i / 50 + 30*scalingFactor))
                        //     }
                        //     fill(0, 0, 80, 20)
                        //     for (let i = 0; i < height; i += 2*scalingFactor) {
                        //         rect(random(0, width*2/3), random(i, i + 40*scalingFactor), random(width/3, width), random(i + 20*scalingFactor, i + 50*scalingFactor))
                        //         rect(random(0, width*2/3), random(i, i + 40*scalingFactor), random(width/3, width), random(i + 20*scalingFactor, i + 50*scalingFactor))
                        //         rect(random(0, width*2/3), random(i, i + 40*scalingFactor), random(width/3, width), random(i + 20*scalingFactor, i + 50*scalingFactor))
                        //     }
                        // }
                        // imageMode(CENTER)
                        // for (let y = 0; y <= height; y += width/3) {
                        //     image(utopianSkyFog, width / 6, width / 6 + y, width/3 + 5, width/3 + 5)
                        //     image(utopianSkyFog, width / 2, width / 6 + y, width/3 + 5, width/3 + 5)
                        //     image(utopianSkyFog, 5*width / 6, width / 6 + y, width/3 + 5, width/3 + 5)
                        // }
                        // imageMode(CORNER)
                        // noLoop()
                    }
                    return
                }
            } if (stage === 1) { // stage 1: clones have just appeared
                let raisedArm = unsafeClones.includes(role)
                let cloneRadius = mainBodyWidth*2/7
                let innerGreenDotRadius = mainBodyWidth*2/7
                let outerGreenDotRadius = mainBodyWidth*3/7
                let innerGreenDotPosition
                let outerGreenDotPosition

                stroke(0, 0, 80)
                // where to display clone and dots?
                switch (role) {
                    case "MT":
                        displayFatebreaker([0, -cloneRadius], raisedArm)
                        displayGreenDot(0, -innerGreenDotRadius)
                        displayGreenDot(0, -outerGreenDotRadius)
                        innerGreenDotPosition = [0, -innerGreenDotRadius]
                        outerGreenDotPosition = [0, -outerGreenDotRadius]
                        break
                    case "OT":
                        displayFatebreaker([cloneRadius*0.707, -cloneRadius*0.707], raisedArm)
                        displayGreenDot(innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707)
                        displayGreenDot(outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707]
                        break
                    case "R2":
                        displayFatebreaker([cloneRadius, 0], raisedArm)
                        displayGreenDot(innerGreenDotRadius, 0)
                        displayGreenDot(outerGreenDotRadius, 0)
                        innerGreenDotPosition = [innerGreenDotRadius, 0]
                        outerGreenDotPosition = [outerGreenDotRadius, 0]
                        break
                    case "M2":
                        displayFatebreaker([cloneRadius*0.707, cloneRadius*0.707], raisedArm)
                        displayGreenDot(innerGreenDotRadius*0.707, innerGreenDotRadius*0.707)
                        displayGreenDot(outerGreenDotRadius*0.707, outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [outerGreenDotRadius*0.707, outerGreenDotRadius*0.707]
                        break
                    case "H2":
                        displayFatebreaker([0, cloneRadius], raisedArm)
                        displayGreenDot(0, innerGreenDotRadius)
                        displayGreenDot(0, outerGreenDotRadius)
                        innerGreenDotPosition = [0, innerGreenDotRadius]
                        outerGreenDotPosition = [0, outerGreenDotRadius]
                        break
                    case "M1":
                        displayFatebreaker([-cloneRadius*0.707, cloneRadius*0.707], raisedArm)
                        displayGreenDot(-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707)
                        displayGreenDot(-outerGreenDotRadius*0.707, outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [-outerGreenDotRadius*0.707, outerGreenDotRadius*0.707]
                        break
                    case "H1":
                        displayFatebreaker([-cloneRadius, 0], raisedArm)
                        displayGreenDot(-innerGreenDotRadius, 0)
                        displayGreenDot(-outerGreenDotRadius, 0)
                        innerGreenDotPosition = [-innerGreenDotRadius, 0]
                        outerGreenDotPosition = [-outerGreenDotRadius, 0]
                        break
                    case "R1":
                        displayFatebreaker([-cloneRadius*0.707, -cloneRadius*0.707], raisedArm)
                        displayGreenDot(-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707)
                        displayGreenDot(-outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [-outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707]
                        break
                }

                let veryInnerRadius = mainBodyWidth/7

                // handle clicking on the green dots
                if (sqrt((mouseX - innerGreenDotPosition[0] - (mainBodyX + mainBodyWidth/2))**2 +
                    (mouseY - innerGreenDotPosition[1] - (mainBodyY + mainBodyHeight/2))**2) < 10*scalingFactor) {
                    if (mousePressedButNotHeldDown()) {
                        // this is the INNER green dot. this is only good if
                        // your clone's arm is raised.
                        if (unsafeClones.includes(role)) {
                            // skip a stage because the second stage is
                            // designed for moving in response to your partners
                            textAtTop = "Move to your spread or stack spot" +
                                " based on who remains on the wall."
                            textAtBottom = "You ran in. \n[PASS] — Your" +
                                " clone's arm is raised."
                            stage = 3

                            if (unsafeClones.includes("MT") || unsafeClones.includes("H2")) {
                                MT = [0, -veryInnerRadius]
                            } if (unsafeClones.includes("OT") || unsafeClones.includes("M1")) {
                                OT = [veryInnerRadius*0.707, -veryInnerRadius*0.707]
                            } if (unsafeClones.includes("R2") || unsafeClones.includes("H1")) {
                                R2 = [veryInnerRadius, 0]
                            } if (unsafeClones.includes("M2") || unsafeClones.includes("R1")) {
                                M2 = [veryInnerRadius*0.707, veryInnerRadius*0.707]
                            } if (unsafeClones.includes("H2") || unsafeClones.includes("MT")) {
                                H2 = [0, veryInnerRadius]
                            } if (unsafeClones.includes("M1") || unsafeClones.includes("OT")) {
                                M1 = [-veryInnerRadius*0.707, veryInnerRadius*0.707]
                            } if (unsafeClones.includes("H1") || unsafeClones.includes("R2")) {
                                H1 = [-veryInnerRadius, 0]
                            } if (unsafeClones.includes("R1") || unsafeClones.includes("M2")) {
                                R1 = [-veryInnerRadius*0.707, -veryInnerRadius*0.707]
                            }
                        } else {
                            // otherwise you failed
                            textAtTop = "You ran in prematurely. While this" +
                                " in and of itself may not cause a wipe, it" +
                                " will confuse\nother people and it will" +
                                " generally lead to a wipe. Please don't" +
                                " take the risk."
                            textAtBottom = "You ran in. \n[FAIL] — Your" +
                                " clone's arm is lowered."
                            stage = 100
                            updateLosses(4)

                            if (unsafeClones.includes("MT") || role === "MT") {
                                MT = [0, -innerGreenDotRadius]
                            } if (unsafeClones.includes("OT") || role === "OT") {
                                OT = [innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("R2") || role === "R2") {
                                R2 = [innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("M2") || role === "M2") {
                                M2 = [innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H2") || role === "H2") {
                                H2 = [0, innerGreenDotRadius]
                            } if (unsafeClones.includes("M1") || role === "M1") {
                                M1 = [-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H1") || role === "H1") {
                                H1 = [-innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("R1") || role === "R1") {
                                R1 = [-innerGreenDotRadius * 0.707, -innerGreenDotRadius * 0.707]
                            }
                        }
                    }
                    return
                } if (sqrt((mouseX - outerGreenDotPosition[0] - (mainBodyX + mainBodyWidth/2))**2 +
                    (mouseY - outerGreenDotPosition[1] - (mainBodyY + mainBodyHeight/2))**2) < 10*scalingFactor) {
                    if (mousePressedButNotHeldDown()) {
                        // this is the OUTER green dot. this is only good if
                        // your clone's arm is lowered.
                        if (unsafeClones.includes(role)) {
                            // you failed
                            textAtTop = "You ran in too late. This will" +
                                " cause confusion for you, the person" +
                                " opposite you, and everyone\nelse who ran" +
                                " in. Try to move as soon as you can."
                            textAtBottom = "You stayed where you are." +
                                " \n[FAIL] — Your clone's arm is raised."
                            stage = 100
                            updateLosses(4)

                            if (unsafeClones.includes("MT") && role !== "MT") {
                                MT = [0, -innerGreenDotRadius]
                            } if (unsafeClones.includes("OT") && role !== "OT") {
                                OT = [innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("R2") && role !== "R2") {
                                R2 = [innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("M2") && role !== "M2") {
                                M2 = [innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H2") && role !== "H2") {
                                H2 = [0, innerGreenDotRadius]
                            } if (unsafeClones.includes("M1") && role !== "M1") {
                                M1 = [-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H1") && role !== "H1") {
                                H1 = [-innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("R1") && role !== "R1") {
                                R1 = [-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            }
                        } else {
                            // you passed for now
                            textAtTop = "3 of your partners have just moved" +
                                " in. Click on the spot you will go." +
                                " \n(Though this is a trivial decision part," +
                                " it helps to gain perspective. It may be" +
                                " better to \nview your screen in a weird way" +
                                " based on how you will orient your camera.)"
                            textAtBottom = "You stayed where you are." +
                                " \n[PASS] — Your clone's arm is lowered."
                            stage = 2

                            if (unsafeClones.includes("MT")) {
                                MT = [0, -innerGreenDotRadius]
                            } if (unsafeClones.includes("OT")) {
                                OT = [innerGreenDotRadius * 0.707, -innerGreenDotRadius * 0.707]
                            } if (unsafeClones.includes("R2")) {
                                R2 = [innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("M2")) {
                                M2 = [innerGreenDotRadius * 0.707, innerGreenDotRadius * 0.707]
                            } if (unsafeClones.includes("H2")) {
                                H2 = [0, innerGreenDotRadius]
                            } if (unsafeClones.includes("M1")) {
                                M1 = [-innerGreenDotRadius * 0.707, innerGreenDotRadius * 0.707]
                            } if (unsafeClones.includes("H1")) {
                                H1 = [-innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("R1")) {
                                R1 = [-innerGreenDotRadius * 0.707, -innerGreenDotRadius * 0.707]
                            }
                        }
                    }
                    return
                }
            } if (stage === 2) {
                let innerGreenDotRadius = mainBodyWidth/7
                let outerGreenDotRadius = mainBodyWidth*3/7
                let innerGreenDotPosition
                let outerGreenDotPosition
                let oppositeRole // we might as well calculate this now

                // where to display dots?
                switch (role) {
                    case "MT":
                        displayGreenDot(0, -innerGreenDotRadius)
                        displayGreenDot(0, -outerGreenDotRadius)
                        innerGreenDotPosition = [0, -innerGreenDotRadius]
                        outerGreenDotPosition = [0, -outerGreenDotRadius]
                        oppositeRole = "H2"
                        break
                    case "OT":
                        displayGreenDot(innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707)
                        displayGreenDot(outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707]
                        oppositeRole = "M1"
                        break
                    case "R2":
                        displayGreenDot(innerGreenDotRadius, 0)
                        displayGreenDot(outerGreenDotRadius, 0)
                        innerGreenDotPosition = [innerGreenDotRadius, 0]
                        outerGreenDotPosition = [outerGreenDotRadius, 0]
                        oppositeRole = "H1"
                        break
                    case "M2":
                        displayGreenDot(innerGreenDotRadius*0.707, innerGreenDotRadius*0.707)
                        displayGreenDot(outerGreenDotRadius*0.707, outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [outerGreenDotRadius*0.707, outerGreenDotRadius*0.707]
                        oppositeRole = "R1"
                        break
                    case "H2":
                        displayGreenDot(0, innerGreenDotRadius)
                        displayGreenDot(0, outerGreenDotRadius)
                        innerGreenDotPosition = [0, innerGreenDotRadius]
                        outerGreenDotPosition = [0, outerGreenDotRadius]
                        oppositeRole = "MT"
                        break
                    case "M1":
                        displayGreenDot(-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707)
                        displayGreenDot(-outerGreenDotRadius*0.707, outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [-outerGreenDotRadius*0.707, outerGreenDotRadius*0.707]
                        oppositeRole = "OT"
                        break
                    case "H1":
                        displayGreenDot(-innerGreenDotRadius, 0)
                        displayGreenDot(-outerGreenDotRadius, 0)
                        innerGreenDotPosition = [-innerGreenDotRadius, 0]
                        outerGreenDotPosition = [-outerGreenDotRadius, 0]
                        oppositeRole = "R2"
                        break
                    case "R1":
                        displayGreenDot(-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707)
                        displayGreenDot(-outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [-outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707]
                        oppositeRole = "M2"
                        break
                }

                // handle clicking on the green dots
                if (sqrt((mouseX - innerGreenDotPosition[0] - (mainBodyX + mainBodyWidth/2))**2 +
                    (mouseY - innerGreenDotPosition[1] - (mainBodyY + mainBodyHeight/2))**2) < 10*scalingFactor) {
                    // the INNER dot
                    if (mousePressedButNotHeldDown()) {
                        if (unsafeClones.includes(oppositeRole)) {
                            textAtTop = "Move to your spread or stack spot" +
                                " based on who remains on the wall."
                            textAtBottom = "You ran in. \n[PASS] — The" +
                                " person opposite you moved in."
                            stage = 3

                            if (unsafeClones.includes("MT") || unsafeClones.includes("H2")) {
                                MT = [0, -innerGreenDotRadius]
                            } if (unsafeClones.includes("OT") || unsafeClones.includes("M1")) {
                                OT = [innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("R2") || unsafeClones.includes("H1")) {
                                R2 = [innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("M2") || unsafeClones.includes("R1")) {
                                M2 = [innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H2") || unsafeClones.includes("MT")) {
                                H2 = [0, innerGreenDotRadius]
                            } if (unsafeClones.includes("M1") || unsafeClones.includes("OT")) {
                                M1 = [-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H1") || unsafeClones.includes("R2")) {
                                H1 = [-innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("R1") || unsafeClones.includes("M2")) {
                                R1 = [-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            }
                        } else {
                            // you failed
                            textAtTop = "You ran in. People are confused" +
                                " when there is only 1 person at the edge."
                            textAtBottom = "You ran in." +
                                " \n[FAIL] — The person opposite you stayed" +
                                " out."
                            stage = 100
                            updateLosses(4)

                            if (unsafeClones.includes("MT") || unsafeClones.includes("H2") || role === "MT") {
                                MT = [0, -innerGreenDotRadius]
                            } if (unsafeClones.includes("OT") || unsafeClones.includes("M1") || role === "OT") {
                                OT = [innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("R2") || unsafeClones.includes("H1") || role === "R2") {
                                R2 = [innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("M2") || unsafeClones.includes("R1") || role === "M2") {
                                M2 = [innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H2") || unsafeClones.includes("MT") || role === "H2") {
                                H2 = [0, innerGreenDotRadius]
                            } if (unsafeClones.includes("M1") || unsafeClones.includes("OT") || role === "M1") {
                                M1 = [-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H1") || unsafeClones.includes("R2") || role === "H1") {
                                H1 = [-innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("R1") || unsafeClones.includes("M2") || role === "R1") {
                                R1 = [-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            }
                        }
                    }
                    return
                } if (sqrt((mouseX - outerGreenDotPosition[0] - (mainBodyX + mainBodyWidth/2))**2 +
                    (mouseY - outerGreenDotPosition[1] - (mainBodyY + mainBodyHeight/2))**2) < 10*scalingFactor) {
                    // the OUTER dot
                    if (mousePressedButNotHeldDown()) {
                        if (unsafeClones.includes(oppositeRole)) {
                            // you failed
                            textAtTop = "You ran in too late. This will" +
                                " cause confusion for you, the person" +
                                " opposite you, and everyone\nelse who ran" +
                                " in. Try to move as soon as you can."
                            textAtBottom = "You stayed where you are." +
                                " \n[FAIL] — The person opposite you moved in."
                            stage = 100
                            updateLosses(4)

                            if (unsafeClones.includes("MT") || unsafeClones.includes("H2") && role !== "MT") {
                                MT = [0, -innerGreenDotRadius]
                            } if (unsafeClones.includes("OT") || unsafeClones.includes("M1") && role !== "OT") {
                                OT = [innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("R2") || unsafeClones.includes("H1") && role !== "R2") {
                                R2 = [innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("M2") || unsafeClones.includes("R1") && role !== "M2") {
                                M2 = [innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H2") || unsafeClones.includes("MT") && role !== "H2") {
                                H2 = [0, innerGreenDotRadius]
                            } if (unsafeClones.includes("M1") || unsafeClones.includes("OT") && role !== "M1") {
                                M1 = [-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H1") || unsafeClones.includes("R2") && role !== "H1") {
                                H1 = [-innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("R1") || unsafeClones.includes("M2") && role !== "R1") {
                                R1 = [-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            }
                        } else {
                            textAtTop = "Move to your spread or stack spot" +
                                " based on who remains on the wall."
                            textAtBottom = "You ran out. \n[PASS] — The" +
                                " person opposite you stayed out."
                            stage = 3

                            if (unsafeClones.includes("MT") || unsafeClones.includes("H2")) {
                                MT = [0, -innerGreenDotRadius]
                            } if (unsafeClones.includes("OT") || unsafeClones.includes("M1")) {
                                OT = [innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("R2") || unsafeClones.includes("H1")) {
                                R2 = [innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("M2") || unsafeClones.includes("R1")) {
                                M2 = [innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H2") || unsafeClones.includes("MT")) {
                                H2 = [0, innerGreenDotRadius]
                            } if (unsafeClones.includes("M1") || unsafeClones.includes("OT")) {
                                M1 = [-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                            } if (unsafeClones.includes("H1") || unsafeClones.includes("R2")) {
                                H1 = [-innerGreenDotRadius, 0]
                            } if (unsafeClones.includes("R1") || unsafeClones.includes("M2")) {
                                R1 = [-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                            }
                        }
                    }
                    return
                }
            } if (stage === 3) {
                // final stage—just clear it already!!! XD
                let stackSpot
                let spreadSpot
                let lightParty
                let outerRadius = mainBodyWidth*3/7 // where everyone will be
                // when next to the death wall
                let innerRadius = mainBodyWidth*2/7 // where the tank will be
                // when spreading
                let angleDiffForDPS = 17.5 // how far the DPS go clockwise/counterclockwise away from the healer
                let actualRadius // how far you will be

                // find which light party you are on
                if (role === "MT" || role === "M1" || role === "H1" || role === "R1") {
                    lightParty = 1
                } else lightParty = 2

                // find which angle you'll want to go to
                let angle
                switch (safeDirections) {
                    case "MT H2":
                        if (lightParty === 1) angle = 270
                        if (lightParty === 2) angle = 90
                        break
                    case "OT M1":
                        if (lightParty === 1) angle = 135
                        if (lightParty === 2) angle = 315
                        break
                    case "R2 H1":
                        if (lightParty === 1) angle = 180
                        if (lightParty === 2) angle = 0
                        break
                    case "M2 R1":
                        if (lightParty === 1) angle = 225
                        if (lightParty === 2) angle = 45
                        break
                }

                stackSpot = [cos(radians(angle))*outerRadius, sin(radians(angle))*outerRadius]

                // figure out the spread spot. slightly more nuianced, but
                // not so much.
                switch (role) {
                    case "MT":
                        actualRadius = innerRadius
                        break
                    case "OT":
                        actualRadius = innerRadius
                        break
                    case "R2":
                        actualRadius = outerRadius
                        angle += angleDiffForDPS
                        break
                    case "M2":
                        actualRadius = outerRadius
                        angle -= angleDiffForDPS
                        break
                    case "H2":
                        actualRadius = outerRadius
                        break
                    case "M1":
                        actualRadius = outerRadius
                        angle -= angleDiffForDPS
                        break
                    case "H1":
                        actualRadius = outerRadius
                        break
                    case "R1":
                        actualRadius = outerRadius
                        angle += angleDiffForDPS
                        break
                }
                spreadSpot = [cos(radians(angle))*actualRadius, sin(radians(angle))*actualRadius]

                // display!
                displayGreenDot(spreadSpot[0], spreadSpot[1])
                displayGreenDot(stackSpot[0], stackSpot[1])

                // also make sure that if you're a healer, you don't
                // accidentally pick up both the spread and stack
                if ((sqrt((mouseX - spreadSpot[0] - (mainBodyX + mainBodyWidth/2))**2 +
                        (mouseY - spreadSpot[1] - (mainBodyY + mainBodyHeight/2))**2) < 10*scalingFactor)
                    && !(role === "H1" || role === "H2")) {
                    if (mousePressedButNotHeldDown()) {
                        if (spreadOrStack === "spread") {
                            textAtTop = "Congratulations! You made it" +
                                " through everything, although this is one" +
                                " of the easier mechanics \nto do when not" +
                                " timed."
                            textAtBottom = "You went to your spread spot." +
                                " \n[PASS] It's spreads. [CLEARED, " + formatSeconds((millis() - mechanicStarted)/1000) + "]"
                            stage = 99
                            updateWins(4)
                        } else {
                            textAtTop = "You went to the wrong position. If" +
                                " you're having trouble, you might want to" +
                                " be a healer. They\ndon't have to worry" +
                                " about spread or stack. (joking)"
                            textAtBottom = "You went to your spread spot." +
                                " \n[FAIL] It's stacks."
                            stage = 100
                            updateLosses(4)
                        }
                    }
                    return
                } if (sqrt((mouseX - stackSpot[0] - (mainBodyX + mainBodyWidth/2))**2 +
                    (mouseY - stackSpot[1] - (mainBodyY + mainBodyHeight/2))**2) < 10*scalingFactor) {
                    if (mousePressedButNotHeldDown()) {
                        if (spreadOrStack === "spread" && !(role === "H1" || role === "H2")) {
                            textAtTop = "You went to the wrong position. If" +
                                " you're having trouble, you might want to" +
                                " be a healer. They\ndon't have to worry" +
                                " about spread or stack. (joking)"
                            textAtBottom = "You went to your stack spot." +
                                " \n[FAIL] It's spreads."
                            stage = 100
                            updateLosses(4)
                        } else {
                            textAtTop = "Congratulations! You made it" +
                                " through everything, although this is one" +
                                " of the easier mechanics \nto do when not" +
                                " timed."
                            textAtBottom = "You went to your stack spot." +
                                " \n[PASS] It's stacks. [CLEARED, " + formatSeconds((millis() - mechanicStarted)/1000) + "]"

                            if (role === "H1" || role === "H2") {
                                textAtTop += "\n\n\nHey, you're a healer." +
                                    " Stop cheating by not having to worry" +
                                    " about stack or spread."
                                textAtBottom = "You went to your" +
                                    " stack—I mean, spread—wait, there" +
                                    " isn't even a difference—spot." +
                                    " \n[PASS] You're a healer. [CLEARED, " + formatSeconds((millis() - mechanicStarted)/1000) + "]"
                            }

                            stage = 99
                            updateWins(4)
                        }
                        return
                    }
                }
            }
        }
    }
    // Futures Rewritten Ultimate phase 2 background
    if (currentlySelectedBackground === "FRU P2") {
        // background image. also rotated for some reason, but not as much
        rotate(rotation)

        push()
        rotate(0.01)
        tint(0, 0, 100, 5)
        image(fruP2Image, -mainBodyWidth/2 + 20*scalingFactor, -mainBodyWidth/2 + 20*scalingFactor,
            mainBodyWidth - 40*scalingFactor, mainBodyWidth - 40*scalingFactor)
        pop()


        // waymarks
        strokeWeight(2*scalingFactor)
        textSize(16*scalingFactor)
        fill(0, 60, 60)
        stroke(0, 60, 60)
        textAlign(CENTER, CENTER)
        text("1", -mainBodyWidth/5, -mainBodyWidth/5 - 3*scalingFactor)
        text("A", 0, -2*mainBodyWidth/7 - 3*scalingFactor)
        fill(90, 60, 60)
        stroke(90, 60, 60)
        text("2", mainBodyWidth/5, -mainBodyWidth/5 - 3*scalingFactor)
        text("B", 2*mainBodyWidth/7, -3*scalingFactor)
        fill(180, 60, 60)
        stroke(180, 60, 60)
        text("3", mainBodyWidth/5, mainBodyWidth/5 - 3*scalingFactor)
        text("C", 0, 2*mainBodyWidth/7 - 3*scalingFactor)
        fill(270, 60, 60)
        stroke(270, 60, 60)
        text("4", -mainBodyWidth/5, mainBodyWidth/5 - 3*scalingFactor)
        text("D", -2*mainBodyWidth/7, -3*scalingFactor)

        // display the waymark "glow"
        strokeWeight(scalingFactor)
        fill(0, 30, 80)
        stroke(0, 30, 80)
        text("1", -mainBodyWidth/5, -mainBodyWidth/5 - 3*scalingFactor)
        text("A", 0, -2*mainBodyWidth/7 - 3*scalingFactor)
        fill(90, 30, 80)
        stroke(90, 30, 80)
        text("2", mainBodyWidth/5, -mainBodyWidth/5 - 3*scalingFactor)
        text("B", 2*mainBodyWidth/7, -3*scalingFactor)
        fill(180, 30, 80)
        stroke(180, 30, 80)
        text("3", mainBodyWidth/5, mainBodyWidth/5 - 3*scalingFactor)
        text("C", 0, 2*mainBodyWidth/7 - 3*scalingFactor)
        fill(270, 30, 80)
        stroke(270, 30, 80)
        text("4", -mainBodyWidth/5, mainBodyWidth/5 - 3*scalingFactor)
        text("D", -2*mainBodyWidth/7, -3*scalingFactor)

        noStroke()
        fill(0, 0, 100)
        text("1", -mainBodyWidth/5, -mainBodyWidth/5 - 3*scalingFactor)
        text("A", 0, -2*mainBodyWidth/7 - 3*scalingFactor)
        text("2", mainBodyWidth/5, -mainBodyWidth/5 - 3*scalingFactor)
        text("B", 2*mainBodyWidth/7, -3*scalingFactor)
        text("3", mainBodyWidth/5, mainBodyWidth/5 - 3*scalingFactor)
        text("C", 0, 2*mainBodyWidth/7 - 3*scalingFactor)
        text("4", -mainBodyWidth/5, mainBodyWidth/5 - 3*scalingFactor)
        text("D", -2*mainBodyWidth/7, -3*scalingFactor)
        textSize(7*scalingFactor)
        textAlign(LEFT, BOTTOM)


        // do the same for the rectangles/circles around the waymark
        noFill()
        strokeWeight(3*scalingFactor)
        stroke(0, 60, 60)
        rect(-mainBodyWidth/5 - 10*scalingFactor, -mainBodyWidth/5 - 10*scalingFactor,
            -mainBodyWidth/5 + 10*scalingFactor, -mainBodyWidth/5 + 10*scalingFactor)
        circle(0, -2*mainBodyWidth/7, 20*scalingFactor)
        stroke(90, 60, 60)
        rect(mainBodyWidth/5 - 10*scalingFactor, -mainBodyWidth/5 - 10*scalingFactor,
            mainBodyWidth/5 + 10*scalingFactor, -mainBodyWidth/5 + 10*scalingFactor)
        circle(2*mainBodyWidth/7, 0, 20*scalingFactor)
        stroke(180, 60, 60)
        rect(mainBodyWidth/5 - 10*scalingFactor, mainBodyWidth/5 - 10*scalingFactor,
            mainBodyWidth/5 + 10*scalingFactor, mainBodyWidth/5 + 10*scalingFactor)
        circle(0, 2*mainBodyWidth/7, 20*scalingFactor)
        stroke(270, 60, 60)
        rect(-mainBodyWidth/5 - 10*scalingFactor, mainBodyWidth/5 - 10*scalingFactor,
            -mainBodyWidth/5 + 10*scalingFactor, mainBodyWidth/5 + 10*scalingFactor)
        circle(-2*mainBodyWidth/7, 0, 20*scalingFactor)

        strokeWeight(2*scalingFactor)
        stroke(0, 30, 80)
        rect(-mainBodyWidth/5 - 10*scalingFactor, -mainBodyWidth/5 - 10*scalingFactor,
            -mainBodyWidth/5 + 10*scalingFactor, -mainBodyWidth/5 + 10*scalingFactor)
        circle(0, -2*mainBodyWidth/7, 20*scalingFactor)
        stroke(90, 30, 80)
        rect(mainBodyWidth/5 - 10*scalingFactor, -mainBodyWidth/5 - 10*scalingFactor,
            mainBodyWidth/5 + 10*scalingFactor, -mainBodyWidth/5 + 10*scalingFactor)
        circle(2*mainBodyWidth/7, 0, 20*scalingFactor)
        stroke(180, 30, 80)
        rect(mainBodyWidth/5 - 10*scalingFactor, mainBodyWidth/5 - 10*scalingFactor,
            mainBodyWidth/5 + 10*scalingFactor, mainBodyWidth/5 + 10*scalingFactor)
        circle(0, 2*mainBodyWidth/7, 20*scalingFactor)
        stroke(270, 30, 80)
        rect(-mainBodyWidth/5 - 10*scalingFactor, mainBodyWidth/5 - 10*scalingFactor,
            -mainBodyWidth/5 + 10*scalingFactor, mainBodyWidth/5 + 10*scalingFactor)
        circle(-2*mainBodyWidth/7, 0, 20*scalingFactor)

        strokeWeight(scalingFactor)
        stroke(0, 0, 100)
        rect(-mainBodyWidth/5 - 10*scalingFactor, -mainBodyWidth/5 - 10*scalingFactor,
            -mainBodyWidth/5 + 10*scalingFactor, -mainBodyWidth/5 + 10*scalingFactor)
        circle(0, -2*mainBodyWidth/7, 20*scalingFactor)
        rect(mainBodyWidth/5 - 10*scalingFactor, -mainBodyWidth/5 - 10*scalingFactor,
            mainBodyWidth/5 + 10*scalingFactor, -mainBodyWidth/5 + 10*scalingFactor)
        circle(2*mainBodyWidth/7, 0, 20*scalingFactor)
        rect(mainBodyWidth/5 - 10*scalingFactor, mainBodyWidth/5 - 10*scalingFactor,
            mainBodyWidth/5 + 10*scalingFactor, mainBodyWidth/5 + 10*scalingFactor)
        circle(0, 2*mainBodyWidth/7, 20*scalingFactor)
        rect(-mainBodyWidth/5 - 10*scalingFactor, mainBodyWidth/5 - 10*scalingFactor,
            -mainBodyWidth/5 + 10*scalingFactor, mainBodyWidth/5 + 10*scalingFactor)
        circle(-2*mainBodyWidth/7, 0, 20*scalingFactor)


        // death wall
        noStroke()
        fill(240, 100, 50, 10)
        beginShape()
        for (let i = 0; i < TWO_PI; i += TWO_PI / 500) {
            vertex(cos(i) * mainBodyWidth / 2,
                sin(i) * mainBodyWidth / 2)
        }
        beginContour()
        for (let i = TWO_PI; i > 0; i -= TWO_PI / 500) {
            vertex(cos(i) * (mainBodyWidth / 2 - 20*scalingFactor),
                sin(i) * (mainBodyWidth / 2 - 20*scalingFactor))
        }
        endContour()
        endShape(CLOSE)


        // notches
        noStroke()
        fill(0, 0, 100)
        for (let i = 0; i < TWO_PI; i += TWO_PI / 72) {
            circle(cos(i) * (mainBodyWidth / 2 - 15*scalingFactor),
                sin(i) * (mainBodyWidth / 2 - 15*scalingFactor), 3*scalingFactor)
        }

        // big notches on cardinals and intercardinals
        fill(120, 100, 50)
        for (let i = 0; i < TWO_PI; i += TWO_PI / 8) {
            circle(cos(i) * (mainBodyWidth / 2 - 15*scalingFactor),
                sin(i) * (mainBodyWidth / 2 - 15*scalingFactor), 7*scalingFactor)
        }

        displayCharacterPositions()
        pop()
        // push()
        // translate(mainBodyWidth/2, mainBodyHeight/2)
        // rotate(frameCount/100)
        // translate((mainBodyWidth/2)*cos(frameCount/100), (mainBodyHeight/2)*sin(frameCount/100))
        if (currentlySelectedMechanic === "Diamond Dust") {
            if (stage === 0) {
                displayGreenDot(0, 0)

                displayShiva([-20*scalingFactor, 0], "clone", null, 15*scalingFactor)
                displayShiva([20*scalingFactor, 0], "boss", null, 15*scalingFactor)

                if (inClickingRange(centerOfBoard, 10*scalingFactor) && mousePressedButNotHeldDown()) {
                    stage = 1
                    textAtTop = "The AoEs have just appeared. Go in or out" +
                        " according to the castbar and whether you got" +
                        " marked, and \nmake sure to go the correct" +
                        " direction. All directions are included for ease of" +
                        " implementation.\nThe green dots are made smaller" +
                        " so that you can't click on two.\n\nThis time, " + markedPlayers +
                        " have been targeted."
                    textAtBottom = "[PASS] — You are waiting in your spot."
                    return
                }
            } if (stage === 1) {
                // display AoEs
                stroke(0, 0, 100)
                strokeWeight(2*scalingFactor)
                fill(200, 50, 100, 10)
                circle(firstCircles[0][0] + centerOfBoard[0], firstCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(firstCircles[1][0] + centerOfBoard[0], firstCircles[1][1] + centerOfBoard[1], 150*scalingFactor)

                if (inOrOut === "in") {
                    displayShiva([0, -mainBodyWidth/5], "clone", "Reap!", 15*scalingFactor)
                } if (inOrOut === "out") {
                    displayShiva([0, -mainBodyWidth/5], "clone", "Cleave!", 15*scalingFactor)
                }

                let radii = [mainBodyWidth/24, mainBodyWidth/12, mainBodyWidth*3/8, mainBodyWidth*3/7]

                let innerDonutPositions = []
                let outerDonutPositions = []
                let innerCirclePositions = []
                let outerCirclePositions = []
                for (let i = 0; i < TWO_PI; i += TWO_PI/8) {
                    innerDonutPositions.push([cos(i)*radii[0] + centerOfBoard[0], sin(i)*radii[0] + centerOfBoard[1]])
                    outerDonutPositions.push([cos(i)*radii[1] + centerOfBoard[0], sin(i)*radii[1] + centerOfBoard[1]])
                    innerCirclePositions.push([cos(i)*radii[2] + centerOfBoard[0], sin(i)*radii[2] + centerOfBoard[1]])
                    outerCirclePositions.push([cos(i)*radii[3] + centerOfBoard[0], sin(i)*radii[3] + centerOfBoard[1]])
                    displaySmallGreenDot(cos(i)*radii[0], sin(i)*radii[0])
                    displaySmallGreenDot(cos(i)*radii[1], sin(i)*radii[1])
                    displaySmallGreenDot(cos(i)*radii[2], sin(i)*radii[2])
                    displaySmallGreenDot(cos(i)*radii[3], sin(i)*radii[3])
                }

                // make sure we know if we got targeted. we'll have a
                // target marker if we are
                stroke(30, 100, 70)
                strokeWeight(2)
                if (markedPlayers === "DPS") {
                    displayTargetSymbol(M1[0] + centerOfBoard[0], M1[1] + centerOfBoard[1])
                    displayTargetSymbol(M2[0] + centerOfBoard[0], M2[1] + centerOfBoard[1])
                    displayTargetSymbol(R1[0] + centerOfBoard[0], R1[1] + centerOfBoard[1])
                    displayTargetSymbol(R2[0] + centerOfBoard[0], R2[1] + centerOfBoard[1])
                } else {
                    displayTargetSymbol(H1[0] + centerOfBoard[0], H1[1] + centerOfBoard[1])
                    displayTargetSymbol(H2[0] + centerOfBoard[0], H2[1] + centerOfBoard[1])
                    displayTargetSymbol(OT[0] + centerOfBoard[0], OT[1] + centerOfBoard[1])
                    displayTargetSymbol(MT[0] + centerOfBoard[0], MT[1] + centerOfBoard[1])
                }

                // click check time!
                if (mousePressedButNotHeldDown() &&
                    (inClickingRanges(innerCirclePositions, 5 * scalingFactor) ||
                        inClickingRanges(outerCirclePositions, 5 * scalingFactor) ||
                        inClickingRanges(innerDonutPositions, 5 * scalingFactor) ||
                        inClickingRanges(outerDonutPositions, 5 * scalingFactor))) {
                    if (inOrOut === "in") {
                        if (inClickingRanges(innerCirclePositions, 5 * scalingFactor)) {
                            textAtTop = "You didn't dodge the cleave properly." +
                                " The message box is located near the north of" +
                                " the arena for display \npurposes. "
                            textAtBottom = "You went out.\n[FAIL] — \"Reap\" is a donut."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        if (inClickingRanges(outerCirclePositions, 5 * scalingFactor)) {
                            textAtTop = "You didn't dodge the cleave properly." +
                                " The message box is located near the north of" +
                                " the arena for display \npurposes. "
                            textAtBottom = "You went out.\n[FAIL] — \"Reap\" is a donut."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        textAtBottom = "[PASS] — \"Reap\" is a donut. You went in."
                    }
                    if (inOrOut === "out") {
                        if (inClickingRanges(innerDonutPositions, 5 * scalingFactor)) {
                            textAtTop = "You didn't dodge the cleave properly." +
                                " The message box is located near the north of" +
                                " the arena for display \npurposes. "
                            textAtBottom = "You went in.\n[FAIL] — \"Cleave\" is a circle."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        if (inClickingRanges(outerDonutPositions, 5 * scalingFactor)) {
                            textAtTop = "You didn't dodge the cleave properly." +
                                " The message box is located near the north of" +
                                " the arena for display \npurposes. "
                            textAtBottom = "You went in.\n[FAIL] — \"Cleave\" is a circle."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        textAtBottom = "[PASS] — \"Cleave\" is a circle. You went out."
                    }

                    let DPSOrSupport = "supports"
                    switch (role) {
                        case "M1":
                            DPSOrSupport = "DPS"
                            break
                        case "M2":
                            DPSOrSupport = "DPS"
                            break
                        case "R1":
                            DPSOrSupport = "DPS"
                            break
                        case "R2":
                            DPSOrSupport = "DPS"
                            break
                    }
                    if (markedPlayers !== DPSOrSupport) { // move in
                        if (inClickingRanges(outerCirclePositions, 5 * scalingFactor)) {
                            textAtTop = "You were supposed to bait a protean."
                            textAtBottom = "You went into your AoE dropping" +
                                " position.\n" + textAtBottom + "\n[FAIL] —" +
                                " You were not marked."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        if (inClickingRanges(outerDonutPositions, 5 * scalingFactor)) {
                            textAtTop = "You were supposed to bait a protean."
                            textAtBottom = "You went into your AoE dropping" +
                                " position.\n" + textAtBottom + "\n[FAIL] —" +
                                " You were not marked."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        textAtBottom += "\n[PASS] — You went in and you were not marked."
                    } else { // move out
                        if (inClickingRanges(innerCirclePositions, 5 * scalingFactor)) {
                            textAtTop = "You were not supposed to bait a protean."
                            textAtBottom = "You went into your protean bait" +
                                " position.\n" + textAtBottom + "\n[FAIL] —" +
                                " You were marked."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        if (inClickingRanges(innerDonutPositions, 5 * scalingFactor)) {
                            textAtTop = "You were not supposed to bait a protean."
                            textAtBottom = "You went into your protean bait" +
                                " position.\n" + textAtBottom + "\n[FAIL] —" +
                                " You were marked."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        textAtBottom += "\n[PASS] — You went out and you were marked."
                    }

                    // account for whether you clicked on a cardinal or
                    // intercardinal
                    let AoEsSpawnedOn = "cardinal"
                    if (abs(firstCircles[0][0]) > scalingFactor &&
                        abs(firstCircles[0][1]) > scalingFactor) {
                        AoEsSpawnedOn = "intercardinal"
                    }

                    let youClickedOn = "cardinal"
                    // inClickingRanges returns the position of the dot you
                    // clicked on.
                    let position = inClickingRanges(innerCirclePositions, 5 * scalingFactor)
                    if (!position) position = inClickingRanges(outerCirclePositions, 5 * scalingFactor)
                    if (!position) position = inClickingRanges(innerDonutPositions, 5 * scalingFactor)
                    if (!position) position = inClickingRanges(outerDonutPositions, 5 * scalingFactor)
                    if (abs(position[0] - centerOfBoard[0]) > scalingFactor &&
                        abs(position[1] - centerOfBoard[1]) > scalingFactor) {
                        youClickedOn = "intercardinal"
                    }


                    if (markedPlayers === DPSOrSupport) { // move opposite the AoEs
                        if (youClickedOn === AoEsSpawnedOn) {
                            textAtTop = `Marked players are supposed to go ` +
                                `opposite the AoEs. If AoEs spawned on two ` +
                                `intercardinals, you will \nwant to go to cardinals ` +
                                `if you're marked, and if AoEs spawned on two cardinals, ` +
                                `you will want to go to the \nintercardinals.`
                            textAtBottom = "You went to a(n) " + youClickedOn +
                                ".\n" + textAtBottom + "\n[FAIL] — AoEs" +
                                " spawned on the " + AoEsSpawnedOn + "s."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        textAtBottom += "\n[PASS] — AoEs spawned on " + AoEsSpawnedOn +
                            ". You went to a(n) " + youClickedOn + "."
                    } else { // move with the AoEs
                        if (youClickedOn !== AoEsSpawnedOn) {
                            textAtTop = `Unmarked players are supposed to go with the AoEs. If AoEs spawned on two cardinals, you will 
want to go to cardinals if you're unmarked, and if AoEs spawned on two intercardinals, you will want to go to the 
intercardinals.`
                            textAtBottom = "You went to a(n) " + youClickedOn +
                                ".\n" + textAtBottom + "\n[FAIL] — AoEs" +
                                " spawned on the " + AoEsSpawnedOn + "s."
                            stage = 100
                            updateLosses(2)
                            return
                        }
                        textAtBottom += "\n[PASS] — AoEs spawned on " + AoEsSpawnedOn +
                            ". You went to a(n) " + youClickedOn + "."
                    }

                    // the most intuitive but also the hardest check awaits:
                    // are you in your clock spot?
                    let correctColor = "red"
                    switch (role) {
                        case "MT":
                            correctColor = "red"
                            break
                        case "OT":
                            correctColor = "yellow"
                            break
                        case "H1":
                            correctColor = "purple"
                            break
                        case "H2":
                            correctColor = "blue"
                            break
                        case "M1":
                            correctColor = "purple"
                            break
                        case "M2":
                            correctColor = "blue"
                            break
                        case "R1":
                            correctColor = "red"
                            break
                        case "R2":
                            correctColor = "yellow"
                            break
                    }

                    // it's easier for me to interpret this when I put it
                    // in terms of a scale from 0 to 360 rather than -180 to
                    // 180, which is why we add and then modulo 360
                    let clickedAngle = (degrees(atan2(position[1] - centerOfBoard[1], position[0] - centerOfBoard[0])) + 360) % 360
                    let clickedColor = "red"
                    switch (true) { // a nifty trick for multiple if statements
                        case (clickedAngle < 10 || clickedAngle > 350):
                            clickedColor = "yellow"
                            break
                        case (clickedAngle > 40 && clickedAngle < 50):
                            clickedColor = "blue"
                            break
                        case (clickedAngle > 80 && clickedAngle < 100):
                            clickedColor = "blue"
                            break
                        case (clickedAngle > 130 && clickedAngle < 140):
                            clickedColor = "purple"
                            break
                        case (clickedAngle > 170 && clickedAngle < 190):
                            clickedColor = "purple"
                            break
                        case (clickedAngle > 220 && clickedAngle < 230):
                            clickedColor = "red"
                            break
                        case (clickedAngle > 260 && clickedAngle < 280):
                            clickedColor = "red"
                            break
                        case (clickedAngle > 310 && clickedAngle < 320):
                            clickedColor = "yellow"
                            break
                    }
                    if (clickedColor === correctColor) {
                        textAtTop = "The next circles have appeared. Move to" +
                            " your spot to dodge AoEs and/or drop star AoEs."
                        textAtBottom = "You went to the correct spot. \n" +
                            textAtBottom + "\n[PASS] — You went to the " + clickedColor +
                            " waymarks."
                        stage = 2
                        // set player positions
                        // each one of these is how far we will be and what
                        // angle we'll be at
                        let MTPosition
                        let R2Position
                        let OTPosition
                        let M2Position
                        let H1Position
                        let M1Position
                        let H2Position
                        let R1Position
                        if (AoEsSpawnedOn === "cardinal") {
                            MTPosition = [1, 270]
                            R2Position = [1, 0]
                            OTPosition = [1, 0]
                            M2Position = [1, 90]
                            H2Position = [1, 90]
                            M1Position = [1, 180]
                            H1Position = [1, 180]
                            R1Position = [1, 270]
                            if (markedPlayers === "supports") {
                                MTPosition[1] -= 45
                                MTPosition[0] = 2
                                OTPosition[1] += 315
                                OTPosition[0] = 2
                                H2Position[1] -= 45
                                H2Position[0] = 2
                                H1Position[1] -= 45
                                H1Position[0] = 2
                            } else {
                                R2Position[1] -= 45
                                R2Position[0] = 2
                                M2Position[1] += 315
                                M2Position[0] = 2
                                M1Position[1] -= 45
                                M1Position[0] = 2
                                R1Position[1] -= 45
                                R1Position[0] = 2
                            }
                        } else {
                            MTPosition = [1, 225]
                            R2Position = [1, 315]
                            OTPosition = [1, 315]
                            M2Position = [1, 45]
                            H2Position = [1, 45]
                            M1Position = [1, 135]
                            H1Position = [1, 135]
                            R1Position = [1, 225]
                            if (markedPlayers === "supports") {
                                MTPosition[1] += 45
                                MTPosition[0] = 2
                                OTPosition[1] += 45
                                OTPosition[0] = 2
                                H2Position[1] += 45
                                H2Position[0] = 2
                                H1Position[1] += 45
                                H1Position[0] = 2
                            } else {
                                R2Position[1] += 45
                                R2Position[0] = 2
                                M2Position[1] += 45
                                M2Position[0] = 2
                                M1Position[1] += 45
                                M1Position[0] = 2
                                R1Position[1] += 45
                                R1Position[0] = 2
                            }
                        } if (inOrOut === "out") {
                            MTPosition[0] += 2
                            R2Position[0] += 2
                            OTPosition[0] += 2
                            M2Position[0] += 2
                            H2Position[0] += 2
                            M1Position[0] += 2
                            H1Position[0] += 2
                            R1Position[0] += 2
                        }
                        let realPositionList = []
                        for (let position of [MTPosition, R2Position, OTPosition, M2Position, H2Position, M1Position, H1Position, R1Position]) {
                            let r = 0
                            switch (position[0]) {
                                case 1:
                                    r = mainBodyWidth/24
                                    break
                                case 2:
                                    r = mainBodyWidth/12
                                    break
                                case 3:
                                    r = 3*mainBodyWidth/8
                                    break
                                case 4:
                                    r = 3*mainBodyWidth/7
                                    break
                            }
                            let x = cos(radians(position[1]))*r
                            let y = sin(radians(position[1]))*r
                            realPositionList.push([x, y])
                        }
                        MT = realPositionList[0]
                        R2 = realPositionList[1]
                        OT = realPositionList[2]
                        M2 = realPositionList[3]
                        H2 = realPositionList[4]
                        M1 = realPositionList[5]
                        H1 = realPositionList[6]
                        R1 = realPositionList[7]

                        // get the people in the correct place
                        for (let i = 0; i < 1000; i++) {
                            updateVectors()
                            push()
                            translateToCenterOfBoard()
                            displayCharacterPositions()
                            pop()
                        }

                        // display donut or circle
                        fill(200, 70, 100, 100)
                        stroke(0, 0, 100, 100)
                        if (inOrOut === "out") { // circle
                            circle(centerOfBoard[0], centerOfBoard[1], 23*mainBodyWidth/32)
                        } if (inOrOut === "in") { // donut
                            beginShape()
                            for (let i = 0; i < TWO_PI; i += TWO_PI/10000) {
                                let x = cos(i)*mainBodyWidth/2 + centerOfBoard[0]
                                let y = sin(i)*mainBodyWidth/2 + centerOfBoard[1]
                                vertex(x, y)
                            }
                            beginContour()
                            for (let i = TWO_PI; i > 0; i -= TWO_PI/10000) {
                                let x = cos(i)*mainBodyWidth/10 + centerOfBoard[0]
                                let y = sin(i)*mainBodyWidth/10 + centerOfBoard[1]
                                vertex(x, y)
                            }
                            endContour()
                            endShape(CLOSE)
                        }
                        frameRate(1)

                        // display proteans
                        fill(60, 100, 100, 60)
                        stroke(0, 0, 100, 100)
                        strokeWeight(5*scalingFactor)
                        if (AoEsSpawnedOn === "cardinal") {
                            arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                                mainBodyWidth, mainBodyHeight, -PI/8, PI/8, PIE)
                            arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                                mainBodyWidth, mainBodyHeight, 3*PI/8, 5*PI/8, PIE)
                            arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                                mainBodyWidth, mainBodyHeight, 7*PI/8, 9*PI/8, PIE)
                            arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                                mainBodyWidth, mainBodyHeight, 11*PI/8, 13*PI/8, PIE)
                        } if (AoEsSpawnedOn === "intercardinal") {
                            arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                                mainBodyWidth, mainBodyHeight, PI/8, 3*PI/8, PIE)
                            arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                                mainBodyWidth, mainBodyHeight, 5*PI/8, 7*PI/8, PIE)
                            arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                                mainBodyWidth, mainBodyHeight, 9*PI/8, 11*PI/8, PIE)
                            arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                                mainBodyWidth, mainBodyHeight, 13*PI/8, 15*PI/8, PIE)
                        }

                        return
                    } else {
                        textAtTop = "You went to the wrong waymark color." +
                            " You're supposed to go to the " + correctColor + " ones."
                        textAtBottom = "You went to the wrong waymark color. \n" +
                            textAtBottom + "\n[FAIL] — You went to the " + clickedColor +
                            " waymarks instead of the " + correctColor + " ones."
                        stage = 100
                        updateLosses(2)
                        return
                    }
                }
            } if (stage === 2) {
                // display AoEs
                stroke(0, 0, 100)
                strokeWeight(2*scalingFactor)
                fill(200, 50, 100, 5)
                circle(firstCircles[0][0] + centerOfBoard[0], firstCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(firstCircles[1][0] + centerOfBoard[0], firstCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                fill(205, 50, 100, 7.5)
                circle(secondCircles[0][0] + centerOfBoard[0], secondCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(secondCircles[1][0] + centerOfBoard[0], secondCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                fill(210, 50, 100, 10)
                circle(fourthCircles[0][0] + centerOfBoard[0], fourthCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(fourthCircles[1][0] + centerOfBoard[0], fourthCircles[1][1] + centerOfBoard[1], 150*scalingFactor)

                // make sure we know if we got targeted. we'll have a
                // target marker if we are
                if (markedPlayers === "DPS") {
                    displayTargetSymbol(M1[0] + centerOfBoard[0], M1[1] + centerOfBoard[1])
                    displayTargetSymbol(M2[0] + centerOfBoard[0], M2[1] + centerOfBoard[1])
                    displayTargetSymbol(R1[0] + centerOfBoard[0], R1[1] + centerOfBoard[1])
                    displayTargetSymbol(R2[0] + centerOfBoard[0], R2[1] + centerOfBoard[1])
                } else {
                    displayTargetSymbol(H1[0] + centerOfBoard[0], H1[1] + centerOfBoard[1])
                    displayTargetSymbol(H2[0] + centerOfBoard[0], H2[1] + centerOfBoard[1])
                    displayTargetSymbol(OT[0] + centerOfBoard[0], OT[1] + centerOfBoard[1])
                    displayTargetSymbol(MT[0] + centerOfBoard[0], MT[1] + centerOfBoard[1])
                }

                // if we're in, we can go out all the way, to the
                // inner ring, or to the center. bandity options indeed,
                // but...you know. the correct option is the inner ring.
                if (inOrOut === "in") {
                    // we know the inner ring will always be 2 times as far
                    // as we are, the center will be the center, and the
                    // outer ring will be the 4.5 times as far as we are.
                    // the far outer will be 5.15 times as far as we are.
                    // this thing is called yourposition so that it doesn't
                    // mistake yourPosition() for a variable.
                    let yourposition = yourPosition()

                    let farOuterPosition = [5.15*yourposition[0] + centerOfBoard[0], 5.15*yourposition[1] + centerOfBoard[1]]
                    let outerRingPosition = [4.3*yourposition[0] + centerOfBoard[0], 4.3*yourposition[1] + centerOfBoard[1]]
                    let innerRingPosition = [2.1*yourposition[0] + centerOfBoard[0], 2.1*yourposition[1] + centerOfBoard[1]]
                    let centerPosition = [centerOfBoard[0], centerOfBoard[1]]

                    displayGreenDot(farOuterPosition[0] - centerOfBoard[0], farOuterPosition[1] - centerOfBoard[1])
                    displayGreenDot(outerRingPosition[0] - centerOfBoard[0], outerRingPosition[1] - centerOfBoard[1])
                    displayGreenDot(innerRingPosition[0] - centerOfBoard[0], innerRingPosition[1] - centerOfBoard[1])
                    displayGreenDot(centerPosition[0] - centerOfBoard[0], centerPosition[1] - centerOfBoard[1])

                    // if you're not marked, you're already done!
                    if (markedPlayers !== DPSOrSupports(role)) {
                        textAtTop = "The rest of the circles have appeared. " +
                            "Move to your spot to get knocked back into the " +
                            "correct location."
                        stage = 3
                        if (markedPlayers === "supports") {
                            MT[0] = MT[0]*2.1
                            MT[1] = MT[1]*2.1
                            OT[0] = OT[0]*2.1
                            OT[1] = OT[1]*2.1
                            H2[0] = H2[0]*2.1
                            H2[1] = H2[1]*2.1
                            H1[0] = H1[0]*2.1
                            H1[1] = H1[1]*2.1
                        } else {
                            R2[0] = R2[0]*2.1
                            R2[1] = R2[1]*2.1
                            M2[0] = M2[0]*2.1
                            M2[1] = M2[1]*2.1
                            M1[0] = M1[0]*2.1
                            M1[1] = M1[1]*2.1
                            R1[0] = R1[0]*2.1
                            R1[1] = R1[1]*2.1
                        }

                        // get the people in the correct place
                        for (let i = 0; i < 1000; i++) {
                            updateVectors()
                            push()
                            translateToCenterOfBoard()
                            displayCharacterPositions()
                            push()
                            rotate(0.01)
                            tint(0, 0, 100, 5)
                            image(fruP2Image, -mainBodyWidth/2 + 20*scalingFactor, -mainBodyWidth/2 + 20*scalingFactor,
                                mainBodyWidth - 40*scalingFactor, mainBodyWidth - 40*scalingFactor)
                            pop()
                            pop()
                        }

                        // display circle explosions
                        push()
                        translateToCenterOfBoard()
                        fill(30, 100, 100, 100)
                        stroke(0, 0, 100, 100)
                        circle(firstCircles[0][0], firstCircles[0][1], 150*scalingFactor)
                        circle(firstCircles[1][0], firstCircles[1][1], 150*scalingFactor)
                        frameRate(1)

                        fill(200, 70, 100, 100)
                        if (markedPlayers === "supports") {
                            circle(MT[0], MT[1], mainBodyWidth/5)
                            circle(OT[0], OT[1], mainBodyWidth/5)
                            circle(H2[0], H2[1], mainBodyWidth/5)
                            circle(H1[0], H1[1], mainBodyWidth/5)
                        } else {
                            circle(R2[0], R2[1], mainBodyWidth/5)
                            circle(M2[0], M2[1], mainBodyWidth/5)
                            circle(M1[0], M1[1], mainBodyWidth/5)
                            circle(R1[0], R1[1], mainBodyWidth/5)
                        }
                        displayCharacterPositions()
                        pop()
                    }

                    // as for the options, you will always want to go to the
                    // inner ring. descriptions vary.
                    if (mousePressedButNotHeldDown()) {
                        if (inClickingRange(farOuterPosition, 10 * scalingFactor)) {
                            textAtTop = "You went too far out."
                            textAtBottom = "You went waaaay too far out. \n" +
                                "[FAIL] — I don't think you can even make the distance!"
                            stage = 100
                            updateLosses(2)
                        } if (inClickingRange(outerRingPosition, 10 * scalingFactor)) {
                            textAtTop = "You went too far out. This is the" +
                                " position you would drop your star AoEs in" +
                                " if it were point-blank AoE."
                            textAtBottom = "You went too far out. \n" +
                                "[FAIL] — You are supposed go to the inner ring."
                            stage = 100
                            updateLosses(2)
                        } if (inClickingRange(innerRingPosition, 10 * scalingFactor)) {
                            textAtTop = "The rest of the circles have appeared. " +
                                "Move to your spot to get knocked back into the " +
                                "correct location."
                            textAtBottom = "You went to the inner ring. \n" +
                                "[PASS] — The inner ring is the correct spot."
                            stage = 3
                            if (markedPlayers === "supports") {
                                MT[0] = MT[0]*2.1
                                MT[1] = MT[1]*2.1
                                OT[0] = OT[0]*2.1
                                OT[1] = OT[1]*2.1
                                H2[0] = H2[0]*2.1
                                H2[1] = H2[1]*2.1
                                H1[0] = H1[0]*2.1
                                H1[1] = H1[1]*2.1
                            } else {
                                R2[0] = R2[0]*2.1
                                R2[1] = R2[1]*2.1
                                M2[0] = M2[0]*2.1
                                M2[1] = M2[1]*2.1
                                M1[0] = M1[0]*2.1
                                M1[1] = M1[1]*2.1
                                R1[0] = R1[0]*2.1
                                R1[1] = R1[1]*2.1
                            }

                            // get the people in the correct place
                            for (let i = 0; i < 1000; i++) {
                                updateVectors()
                                push()
                                translateToCenterOfBoard()
                                displayCharacterPositions()
                                pop()
                            }

                            // display circle explosions
                            push()
                            translateToCenterOfBoard()
                            fill(30, 100, 100, 100)
                            stroke(0, 0, 100, 100)
                            circle(firstCircles[0][0], firstCircles[0][1], 150*scalingFactor)
                            circle(firstCircles[1][0], firstCircles[1][1], 150*scalingFactor)
                            frameRate(1)

                            fill(200, 70, 100, 100)
                            if (markedPlayers === "supports") {
                                circle(MT[0], MT[1], mainBodyWidth/5)
                                circle(OT[0], OT[1], mainBodyWidth/5)
                                circle(H2[0], H2[1], mainBodyWidth/5)
                                circle(H1[0], H1[1], mainBodyWidth/5)
                            } else {
                                circle(R2[0], R2[1], mainBodyWidth/5)
                                circle(M2[0], M2[1], mainBodyWidth/5)
                                circle(M1[0], M1[1], mainBodyWidth/5)
                                circle(R1[0], R1[1], mainBodyWidth/5)
                            }
                            displayCharacterPositions()
                            pop()
                        } if (inClickingRange(centerPosition, 10 * scalingFactor)) {
                            textAtTop = "You did not go out to drop your AOEs."
                            textAtBottom = "You did not go out. \n" +
                                "[FAIL] — You are supposed go to the inner ring."
                            stage = 100
                            updateLosses(2)
                        }
                    }
                }

                // if we're out, we can also go out all the way, to the
                // outer ring, or to just past the AoE.
                if (inOrOut === "out") {
                    let yourposition = yourPosition()
                    let farOuterPosition
                    let outerRingPosition
                    let innerRingPosition
                    if (markedPlayers === DPSOrSupports(role)) {
                        // we will be on the far outer position
                        farOuterPosition = [yourposition[0] + centerOfBoard[0], yourposition[1] + centerOfBoard[1]]
                        outerRingPosition = [0.834 * yourposition[0] + centerOfBoard[0], 0.834 * yourposition[1] + centerOfBoard[1]]
                        innerRingPosition = [0.3 * yourposition[0] + centerOfBoard[0], 0.3 * yourposition[1] + centerOfBoard[1]]
                    } else {
                        // we will be on the outer ring position
                        farOuterPosition = [1.15 * yourposition[0] + centerOfBoard[0], 1.15 * yourposition[1] + centerOfBoard[1]]
                        outerRingPosition = [yourposition[0] + centerOfBoard[0], yourposition[1] + centerOfBoard[1]]
                        innerRingPosition = [0.33 * yourposition[0] + centerOfBoard[0], 0.33 * yourposition[1] + centerOfBoard[1]]
                    }

                    displayGreenDot(farOuterPosition[0] - centerOfBoard[0], farOuterPosition[1] - centerOfBoard[1])
                    displayGreenDot(outerRingPosition[0] - centerOfBoard[0], outerRingPosition[1] - centerOfBoard[1])
                    displayGreenDot(innerRingPosition[0] - centerOfBoard[0], innerRingPosition[1] - centerOfBoard[1])

                    if (mousePressedButNotHeldDown()) {
                        if (inClickingRange(farOuterPosition, 10*scalingFactor)) {
                            if (markedPlayers === DPSOrSupports(role)) {
                                // you pass because marked players are
                                // supposed to stay out
                                textAtTop = "The rest of the circles have" +
                                    " appeared. Move to your spot to get" +
                                    " knocked back into the correct location."
                                textAtBottom = "[PASS] — You stayed where you were."
                                stage = 3
                                if (markedPlayers === "supports") {
                                    R2[0] = R2[0]*0.33
                                    R2[1] = R2[1]*0.33
                                    M2[0] = M2[0]*0.33
                                    M2[1] = M2[1]*0.33
                                    M1[0] = M1[0]*0.33
                                    M1[1] = M1[1]*0.33
                                    R1[0] = R1[0]*0.33
                                    R1[1] = R1[1]*0.33
                                } else {
                                    MT[0] = MT[0]*0.33
                                    MT[1] = MT[1]*0.33
                                    OT[0] = OT[0]*0.33
                                    OT[1] = OT[1]*0.33
                                    H2[0] = H2[0]*0.33
                                    H2[1] = H2[1]*0.33
                                    H1[0] = H1[0]*0.33
                                    H1[1] = H1[1]*0.33
                                }

                                // get the people in the correct place
                                for (let i = 0; i < 1000; i++) {
                                    updateVectors()
                                    push()
                                    translateToCenterOfBoard()
                                    displayCharacterPositions()
                                    pop()
                                }

                                // display circle explosions
                                push()
                                translateToCenterOfBoard()
                                fill(30, 100, 100, 100)
                                stroke(0, 0, 100, 100)
                                circle(firstCircles[0][0], firstCircles[0][1], 150*scalingFactor)
                                circle(firstCircles[1][0], firstCircles[1][1], 150*scalingFactor)
                                frameRate(1)

                                fill(200, 70, 100, 100)
                                if (markedPlayers === "supports") {
                                    circle(MT[0], MT[1], mainBodyWidth/5)
                                    circle(OT[0], OT[1], mainBodyWidth/5)
                                    circle(H2[0], H2[1], mainBodyWidth/5)
                                    circle(H1[0], H1[1], mainBodyWidth/5)
                                } else {
                                    circle(R2[0], R2[1], mainBodyWidth/5)
                                    circle(M2[0], M2[1], mainBodyWidth/5)
                                    circle(M1[0], M1[1], mainBodyWidth/5)
                                    circle(R1[0], R1[1], mainBodyWidth/5)
                                }
                                displayCharacterPositions()
                                pop()
                            } else {
                                textAtTop = "You did not run in as an" +
                                    " unmarked player."
                                textAtBottom = "You went out. \n" +
                                    "[FAIL] — You did not run in.\n" +
                                    "\n" +
                                    "[NOTE] — It is technically okay to not" +
                                    " run in so long as the first AoE did" +
                                    " not spawn on you, but it is better \nto" +
                                    " pre-position for the next mechanic." +
                                    " Besides, it's difficult to code."
                                stage = 100
                                updateLosses(2)
                            }
                        } if (inClickingRange(outerRingPosition, 10*scalingFactor)) {
                            if (markedPlayers === DPSOrSupports(role)) {
                                // descriptions are different for each,
                                // though they result in the same outcome
                                textAtTop = "You ran in slightly too much." +
                                    " Though this will not necessarily cause" +
                                    " a wipe, this may cause the parts of\n" +
                                    "the star AoE running parellel to the" +
                                    " edge to clip other people."
                                textAtBottom = "[FAIL] — You ran in."
                                stage = 100
                                updateLosses(2)
                            } else {
                                textAtTop = "You did not run in as an" +
                                    " unmarked player."
                                textAtBottom = "You stayed where you were. \n" +
                                    "[FAIL] — You did not run in.\n" +
                                    "\n" +
                                    "[NOTE] — It is technically okay to not" +
                                    " run in so long as the first AoE did" +
                                    " not spawn on you, but it is better \nto" +
                                    " pre-position for the next mechanic." +
                                    " Besides, it's difficult to code."
                                stage = 100
                                updateLosses(2)
                            }
                        } if (inClickingRange(innerRingPosition, 10*scalingFactor)) {
                            if (markedPlayers === DPSOrSupports(role)) {
                                textAtTop = "You ran in too much, though" +
                                    " the only reason why we don't run in is" +
                                    " because it takes...more effort." +
                                    " \nThat's all, it wouldn't cause a" +
                                    " wipe, but it's better to avoid it."
                                textAtBottom = "[FAIL] — You ran in."
                                stage = 100
                                updateLosses(2)
                            } else {
                                // you pass because marked players are
                                // supposed to run in
                                textAtTop = "The rest of the circles have" +
                                    " appeared. Move to your spot to get" +
                                    " knocked back into the correct location."
                                textAtBottom = "[PASS] — You ran in."
                                stage = 3
                                if (markedPlayers === "supports") {
                                    R2[0] = R2[0]*0.33
                                    R2[1] = R2[1]*0.33
                                    M2[0] = M2[0]*0.33
                                    M2[1] = M2[1]*0.33
                                    M1[0] = M1[0]*0.33
                                    M1[1] = M1[1]*0.33
                                    R1[0] = R1[0]*0.33
                                    R1[1] = R1[1]*0.33
                                } else {
                                    MT[0] = MT[0]*0.33
                                    MT[1] = MT[1]*0.33
                                    OT[0] = OT[0]*0.33
                                    OT[1] = OT[1]*0.33
                                    H2[0] = H2[0]*0.33
                                    H2[1] = H2[1]*0.33
                                    H1[0] = H1[0]*0.33
                                    H1[1] = H1[1]*0.33
                                }

                                // get the people in the correct place
                                for (let i = 0; i < 1000; i++) {
                                    updateVectors()
                                    push()
                                    translateToCenterOfBoard()
                                    displayCharacterPositions()
                                    pop()
                                }

                                // display circle explosions
                                push()
                                translateToCenterOfBoard()
                                fill(30, 100, 100, 100)
                                stroke(0, 0, 100, 100)
                                circle(firstCircles[0][0], firstCircles[0][1], 150*scalingFactor)
                                circle(firstCircles[1][0], firstCircles[1][1], 150*scalingFactor)
                                frameRate(1)

                                fill(200, 70, 100, 100)
                                if (markedPlayers === "supports") {
                                    circle(MT[0], MT[1], mainBodyWidth/5)
                                    circle(OT[0], OT[1], mainBodyWidth/5)
                                    circle(H2[0], H2[1], mainBodyWidth/5)
                                    circle(H1[0], H1[1], mainBodyWidth/5)
                                } else {
                                    circle(R2[0], R2[1], mainBodyWidth/5)
                                    circle(M2[0], M2[1], mainBodyWidth/5)
                                    circle(M1[0], M1[1], mainBodyWidth/5)
                                    circle(R1[0], R1[1], mainBodyWidth/5)
                                }
                                displayCharacterPositions()
                                pop()
                            }
                        }
                    }
                }
            } if (stage === 3) {
                // display AoEs
                stroke(0, 0, 100)
                strokeWeight(2*scalingFactor)
                fill(210, 50, 100, 5)
                circle(secondCircles[0][0] + centerOfBoard[0], secondCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(secondCircles[1][0] + centerOfBoard[0], secondCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                fill(200, 50, 100, 7.5)
                circle(thirdCircles[0][0] + centerOfBoard[0], thirdCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(thirdCircles[1][0] + centerOfBoard[0], thirdCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                fill(210, 50, 100, 10)
                circle(fourthCircles[0][0] + centerOfBoard[0], fourthCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(fourthCircles[1][0] + centerOfBoard[0], fourthCircles[1][1] + centerOfBoard[1], 150*scalingFactor)

                // display star AoEs
                if (inOrOut === "in") {
                    // intercardinal display
                    if (abs(firstCircles[0][0]) < 5*scalingFactor || abs(firstCircles[0][1]) < 5*scalingFactor) {
                        displayStarAoE(sqrt(2) * 1.05*mainBodyWidth / 12, sqrt(2) * 1.05*mainBodyWidth / 12)
                        displayStarAoE(sqrt(2) * 1.05*mainBodyWidth / 12, -sqrt(2) * 1.05*mainBodyWidth / 12)
                        displayStarAoE(-sqrt(2) * 1.05*mainBodyWidth / 12, -sqrt(2) * 1.05*mainBodyWidth / 12)
                        displayStarAoE(-sqrt(2) * 1.05*mainBodyWidth / 12, sqrt(2) * 1.05*mainBodyWidth / 12)
                    }
                    // cardinal display
                    if (abs(firstCircles[0][0]) > 5*scalingFactor && abs(firstCircles[0][1]) > 5*scalingFactor) {
                        displayStarAoE(1.05*mainBodyWidth / 6, 0)
                        displayStarAoE(0, -1.05*mainBodyWidth / 6)
                        displayStarAoE(-1.05*mainBodyWidth / 6, 0)
                        displayStarAoE(0, 1.05*mainBodyWidth / 6)
                    }
                }
                if (inOrOut === "out") {
                    // intercardinal display
                    if (abs(firstCircles[0][0]) < 5*scalingFactor || abs(firstCircles[0][1]) < 5*scalingFactor) {
                        displayStarAoE(sqrt(2) * 3*mainBodyWidth/14, sqrt(2) * 3*mainBodyWidth/14)
                        displayStarAoE(sqrt(2) * 3*mainBodyWidth/14, -sqrt(2) * 3*mainBodyWidth/14)
                        displayStarAoE(-sqrt(2) * 3*mainBodyWidth/14, -sqrt(2) * 3*mainBodyWidth/14)
                        displayStarAoE(-sqrt(2) * 3*mainBodyWidth/14, sqrt(2) * 3*mainBodyWidth/14)
                    }
                    // cardinal display
                    if (abs(firstCircles[0][0]) > 5*scalingFactor && abs(firstCircles[0][1]) > 5*scalingFactor) {
                        displayStarAoE(3*mainBodyWidth/7, 0)
                        displayStarAoE(0, -3*mainBodyWidth/7)
                        displayStarAoE(-3*mainBodyWidth/7, 0)
                        displayStarAoE(0, 3*mainBodyWidth/7)
                    }
                }

                // 8 dots on each cardinal/intercardinal
                let dotRadius = mainBodyWidth/12
                displayGreenDot(0, dotRadius)
                displayGreenDot(dotRadius, 0)
                displayGreenDot(0, -dotRadius)
                displayGreenDot(-dotRadius, 0)
                displayGreenDot(sqrt(2)*dotRadius/2, sqrt(2)*dotRadius/2)
                displayGreenDot(sqrt(2)*dotRadius/2, -sqrt(2)*dotRadius/2)
                displayGreenDot(-sqrt(2)*dotRadius/2, -sqrt(2)*dotRadius/2)
                displayGreenDot(-sqrt(2)*dotRadius/2, sqrt(2)*dotRadius/2)
                let greenDotLocations = [[centerOfBoard[0], dotRadius + centerOfBoard[1]],
                    [dotRadius + centerOfBoard[0], centerOfBoard[1]],
                    [centerOfBoard[0], -dotRadius + centerOfBoard[1]],
                    [-dotRadius + centerOfBoard[0], centerOfBoard[1]],
                    [sqrt(2)*dotRadius/2 + centerOfBoard[0], sqrt(2)*dotRadius/2 + centerOfBoard[1]],
                    [sqrt(2)*dotRadius/2 + centerOfBoard[0], -sqrt(2)*dotRadius/2 + centerOfBoard[1]],
                    [-sqrt(2)*dotRadius/2 + centerOfBoard[0], -sqrt(2)*dotRadius/2 + centerOfBoard[1]],
                    [-sqrt(2)*dotRadius/2 + centerOfBoard[0], sqrt(2)*dotRadius/2 + centerOfBoard[1]]]

                // now check if it was clicked
                let position = inClickingRanges(greenDotLocations, 10*scalingFactor)
                if (mousePressedButNotHeldDown() && position) {
                    // check if the clicked angle is one of the first circles.
                    let clickedAngle = (atan2(position[1] - centerOfBoard[1], position[0] - centerOfBoard[0]) + TWO_PI) % TWO_PI
                    let firstLightPartyCircleAngle = (atan2(firstCircles[0][1], firstCircles[0][0]) + TWO_PI) % TWO_PI
                    let diffBetweenAngles = degrees(abs(clickedAngle - firstLightPartyCircleAngle))

                    // if we're in light party 1, we will want to be
                    // within 10 diff (or above 350). if we're in light party
                    // 2, we will want to be between 170 and 190 diff
                    if (diffBetweenAngles < 10 || diffBetweenAngles > 350) {
                        if (lightParty() === 1) {
                            textAtTop = "Knockback resolving..."
                            textAtBottom = "You went to the correct" +
                                " knockback spot. \n[PASS] — You went to" +
                                " one of the locations where the first" +
                                " circles spawned. \n[PASS] — You went to" +
                                " the correct light party."
                            stage = 3.5

                            // use firstLightPartyCircleAngle to line
                            // everyone up properly. these things are lined
                            // up such that people can accurately see who's who.

                            // MT = [cos(firstLightPartyCircleAngle)*60*scalingFactor, sin(firstLightPartyCircleAngle)*60*scalingFactor]
                            // H1 = [cos(firstLightPartyCircleAngle)*45*scalingFactor, sin(firstLightPartyCircleAngle)*45*scalingFactor]
                            // M1 = [cos(firstLightPartyCircleAngle)*30*scalingFactor, sin(firstLightPartyCircleAngle)*30*scalingFactor]
                            // R1 = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            // R2 = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            // M2 = [-cos(firstLightPartyCircleAngle)*30*scalingFactor, -sin(firstLightPartyCircleAngle)*30*scalingFactor]
                            // H2 = [-cos(firstLightPartyCircleAngle)*45*scalingFactor, -sin(firstLightPartyCircleAngle)*45*scalingFactor]
                            // OT = [-cos(firstLightPartyCircleAngle)*60*scalingFactor, -sin(firstLightPartyCircleAngle)*60*scalingFactor]

                            MT = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            H1 = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            M1 = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            R1 = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            OT = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            H2 = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            M2 = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            R2 = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                        } else {
                            textAtTop = "You went to the wrong light party." +
                                " Light party 1 always takes the red and" +
                                " purple waymarks, and light \nparty 2 always" +
                                " takes the yellow and blue waymarks."
                            textAtBottom = "You went to the wrong light" +
                                " party. \n[PASS] — You went to one of the" +
                                " locations where the first circles spawned." +
                                " spawned.\n[FAIL] — You went to light party" +
                                " 2's circle instead of light party 1's."
                            stage = 100
                            updateLosses(2)
                        }
                    } else if (diffBetweenAngles > 170 && diffBetweenAngles < 190) {
                        if (lightParty() === 2) {
                            textAtTop = "Knockback resolving..."
                            textAtBottom = "You went to the correct" +
                                " knockback spot. \n[PASS] — You went to" +
                                " one of the locations where the first" +
                                " circles spawned. \n[PASS] — You went to" +
                                " the correct light party."
                            stage = 3.5

                            // use firstLightPartyCircleAngle to line
                            // everyone up properly. these things are lined
                            // up such that people can accurately see who's who.

                            // MT = [cos(firstLightPartyCircleAngle)*60*scalingFactor, sin(firstLightPartyCircleAngle)*60*scalingFactor]
                            // H1 = [cos(firstLightPartyCircleAngle)*45*scalingFactor, sin(firstLightPartyCircleAngle)*45*scalingFactor]
                            // M1 = [cos(firstLightPartyCircleAngle)*30*scalingFactor, sin(firstLightPartyCircleAngle)*30*scalingFactor]
                            // R1 = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            // R2 = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            // M2 = [-cos(firstLightPartyCircleAngle)*30*scalingFactor, -sin(firstLightPartyCircleAngle)*30*scalingFactor]
                            // H2 = [-cos(firstLightPartyCircleAngle)*45*scalingFactor, -sin(firstLightPartyCircleAngle)*45*scalingFactor]
                            // OT = [-cos(firstLightPartyCircleAngle)*60*scalingFactor, -sin(firstLightPartyCircleAngle)*60*scalingFactor]

                            MT = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            H1 = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            M1 = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            R1 = [cos(firstLightPartyCircleAngle)*15*scalingFactor, sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            OT = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            H2 = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            M2 = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                            R2 = [-cos(firstLightPartyCircleAngle)*15*scalingFactor, -sin(firstLightPartyCircleAngle)*15*scalingFactor]
                        } else {
                            textAtTop = "You went to the wrong light party." +
                                " Light party 1 always takes the red and" +
                                " purple waymarks, and light \nparty 2 always" +
                                " takes the yellow and blue waymarks."
                            textAtBottom = "You went to the wrong light" +
                                " party. \n[PASS] — You went to one of the" +
                                " locations where the first circles spawned." +
                                " spawned.\n[FAIL] — You went to light party" +
                                " 1's circle instead of light party 2's."
                            stage = 100
                            updateLosses(2)
                        }
                    } else {
                        textAtTop = "You are supposed to go to one of the" +
                            " places where the first circle spawned."
                        textAtBottom = "You went to the wrong circle." +
                            " \n[FAIL] — You didn't go to one of the" +
                            " locations where the first circles spawned."
                        stage = 100
                        updateLosses(2)

                        // use firstLightPartyCircleAngle to line
                        // everyone up properly.
                    }
                }
            } if (stage === 3.5) {
                // display AoEs
                stroke(0, 0, 100)
                strokeWeight(2*scalingFactor)
                fill(210, 50, 100, 5)
                circle(secondCircles[0][0] + centerOfBoard[0], secondCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(secondCircles[1][0] + centerOfBoard[0], secondCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                fill(200, 50, 100, 7.5)
                circle(thirdCircles[0][0] + centerOfBoard[0], thirdCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(thirdCircles[1][0] + centerOfBoard[0], thirdCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                fill(210, 50, 100, 10)
                circle(fourthCircles[0][0] + centerOfBoard[0], fourthCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(fourthCircles[1][0] + centerOfBoard[0], fourthCircles[1][1] + centerOfBoard[1], 150*scalingFactor)

                // display star AoEs
                if (inOrOut === "in") {
                    // intercardinal display
                    if (abs(firstCircles[0][0]) < 5*scalingFactor || abs(firstCircles[0][1]) < 5*scalingFactor) {
                        displayStarAoE(sqrt(2) * 1.05*mainBodyWidth / 12, sqrt(2) * 1.05*mainBodyWidth / 12)
                        displayStarAoE(sqrt(2) * 1.05*mainBodyWidth / 12, -sqrt(2) * 1.05*mainBodyWidth / 12)
                        displayStarAoE(-sqrt(2) * 1.05*mainBodyWidth / 12, -sqrt(2) * 1.05*mainBodyWidth / 12)
                        displayStarAoE(-sqrt(2) * 1.05*mainBodyWidth / 12, sqrt(2) * 1.05*mainBodyWidth / 12)
                    }
                    // cardinal display
                    if (abs(firstCircles[0][0]) > 5*scalingFactor && abs(firstCircles[0][1]) > 5*scalingFactor) {
                        displayStarAoE(1.05*mainBodyWidth / 6, 0)
                        displayStarAoE(0, -1.05*mainBodyWidth / 6)
                        displayStarAoE(-1.05*mainBodyWidth / 6, 0)
                        displayStarAoE(0, 1.05*mainBodyWidth / 6)
                    }
                }
                if (inOrOut === "out") {
                    // intercardinal display
                    if (abs(firstCircles[0][0]) < 5*scalingFactor || abs(firstCircles[0][1]) < 5*scalingFactor) {
                        displayStarAoE(sqrt(2) * 3*mainBodyWidth/14, sqrt(2) * 3*mainBodyWidth/14)
                        displayStarAoE(sqrt(2) * 3*mainBodyWidth/14, -sqrt(2) * 3*mainBodyWidth/14)
                        displayStarAoE(-sqrt(2) * 3*mainBodyWidth/14, -sqrt(2) * 3*mainBodyWidth/14)
                        displayStarAoE(-sqrt(2) * 3*mainBodyWidth/14, sqrt(2) * 3*mainBodyWidth/14)
                    }
                    // cardinal display
                    if (abs(firstCircles[0][0]) > 5*scalingFactor && abs(firstCircles[0][1]) > 5*scalingFactor) {
                        displayStarAoE(3*mainBodyWidth/7, 0)
                        displayStarAoE(0, -3*mainBodyWidth/7)
                        displayStarAoE(-3*mainBodyWidth/7, 0)
                        displayStarAoE(0, 3*mainBodyWidth/7)
                    }
                }


                // only finish with this stage once everyone has
                // gotten into their positions
                if (((abs(realMT.x - MT[0]) < scalingFactor*2) && (abs(realMT.y - MT[1]) < scalingFactor*2)) &&
                    ((abs(realOT.x - OT[0]) < scalingFactor*2) && (abs(realOT.y - OT[1]) < scalingFactor*2)) &&
                    ((abs(realH1.x - H1[0]) < scalingFactor*2) && (abs(realH1.y - H1[1]) < scalingFactor*2)) &&
                    ((abs(realH2.x - H2[0]) < scalingFactor*2) && (abs(realH2.y - H2[1]) < scalingFactor*2)) &&
                    ((abs(realM1.x - M1[0]) < scalingFactor*2) && (abs(realM1.y - M1[1]) < scalingFactor*2)) &&
                    ((abs(realM2.x - M2[0]) < scalingFactor*2) && (abs(realM2.y - M2[1]) < scalingFactor*2)) &&
                    ((abs(realR1.x - R1[0]) < scalingFactor*2) && (abs(realR1.y - R1[1]) < scalingFactor*2)) &&
                    ((abs(realR2.x - R2[0]) < scalingFactor*2) && (abs(realR2.y - R2[1]) < scalingFactor*2))) {
                    stage = 3.75
                    MT = [realMT.x*10 + random(0, 5)*scalingFactor, realMT.y*10]
                    OT = [realOT.x*10, realOT.y*10 + random(0, 5)*scalingFactor]
                    H1 = [realH1.x*10 - random(0, 5)*scalingFactor, realH1.y*10]
                    H2 = [realH2.x*10, realH2.y*10 - random(0, 5)*scalingFactor]
                    M1 = [realM1.x*10 + random(0, 5)*scalingFactor, realM1.y*10]
                    M2 = [realM2.x*10, realM2.y*10 + random(0, 5)*scalingFactor]
                    R1 = [realR1.x*10 - random(0, 5)*scalingFactor, realR1.y*10]
                    R2 = [realR2.x*10, realR2.y*10 - random(0, 5)*scalingFactor]









                    // display second circles exploding
                    fill(30, 100, 100, 100)
                    stroke(0, 0, 100)
                    circle(secondCircles[0][0] + centerOfBoard[0], secondCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                    circle(secondCircles[1][0] + centerOfBoard[0], secondCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                    circle(fourthCircles[0][0] + centerOfBoard[0], fourthCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                    circle(fourthCircles[1][0] + centerOfBoard[0], fourthCircles[1][1] + centerOfBoard[1], 150*scalingFactor)

                    noStroke()
                    for (let i = mainBodyWidth; i > 0; i -= mainBodyWidth/30) {
                        fill(200, 40, 100, map(i, 0, mainBodyWidth, 0, 10))
                        circle(centerOfBoard[0], centerOfBoard[1], i)
                    }
                }
            } if (stage === 3.75) {
                // display AoEs
                stroke(0, 0, 100)
                strokeWeight(2*scalingFactor)
                fill(210, 50, 100, 5)
                circle(secondCircles[0][0] + centerOfBoard[0], secondCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(secondCircles[1][0] + centerOfBoard[0], secondCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                fill(200, 50, 100, 7.5)
                circle(thirdCircles[0][0] + centerOfBoard[0], thirdCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(thirdCircles[1][0] + centerOfBoard[0], thirdCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                fill(210, 50, 100, 10)
                circle(fourthCircles[0][0] + centerOfBoard[0], fourthCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(fourthCircles[1][0] + centerOfBoard[0], fourthCircles[1][1] + centerOfBoard[1], 150*scalingFactor)

                // display star AoEs
                if (inOrOut === "in") {
                    // intercardinal display
                    if (abs(firstCircles[0][0]) < 5*scalingFactor || abs(firstCircles[0][1]) < 5*scalingFactor) {
                        displayStarAoE(sqrt(2) * 1.05*mainBodyWidth / 12, sqrt(2) * 1.05*mainBodyWidth / 12)
                        displayStarAoE(sqrt(2) * 1.05*mainBodyWidth / 12, -sqrt(2) * 1.05*mainBodyWidth / 12)
                        displayStarAoE(-sqrt(2) * 1.05*mainBodyWidth / 12, -sqrt(2) * 1.05*mainBodyWidth / 12)
                        displayStarAoE(-sqrt(2) * 1.05*mainBodyWidth / 12, sqrt(2) * 1.05*mainBodyWidth / 12)
                    }
                    // cardinal display
                    if (abs(firstCircles[0][0]) > 5*scalingFactor && abs(firstCircles[0][1]) > 5*scalingFactor) {
                        displayStarAoE(1.05*mainBodyWidth / 6, 0)
                        displayStarAoE(0, -1.05*mainBodyWidth / 6)
                        displayStarAoE(-1.05*mainBodyWidth / 6, 0)
                        displayStarAoE(0, 1.05*mainBodyWidth / 6)
                    }
                }
                if (inOrOut === "out") {
                    // intercardinal display
                    if (abs(firstCircles[0][0]) < 5*scalingFactor || abs(firstCircles[0][1]) < 5*scalingFactor) {
                        displayStarAoE(sqrt(2) * 3*mainBodyWidth/14, sqrt(2) * 3*mainBodyWidth/14)
                        displayStarAoE(sqrt(2) * 3*mainBodyWidth/14, -sqrt(2) * 3*mainBodyWidth/14)
                        displayStarAoE(-sqrt(2) * 3*mainBodyWidth/14, -sqrt(2) * 3*mainBodyWidth/14)
                        displayStarAoE(-sqrt(2) * 3*mainBodyWidth/14, sqrt(2) * 3*mainBodyWidth/14)
                    }
                    // cardinal display
                    if (abs(firstCircles[0][0]) > 5*scalingFactor && abs(firstCircles[0][1]) > 5*scalingFactor) {
                        displayStarAoE(3*mainBodyWidth/7, 0)
                        displayStarAoE(0, -3*mainBodyWidth/7)
                        displayStarAoE(-3*mainBodyWidth/7, 0)
                        displayStarAoE(0, 3*mainBodyWidth/7)
                    }
                }


                // turbo knockback! 2 times the speed. handle this by
                // updating vectors anotther time. also make sure to display
                // positions a second time.
                push()
                translateToCenterOfBoard()
                updateVectors()
                displayCharacterPositions()
                pop()

                // display second circles exploding
                fill(30, 100, 100, 100)
                stroke(0, 0, 100)
                circle(secondCircles[0][0] + centerOfBoard[0], secondCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(secondCircles[1][0] + centerOfBoard[0], secondCircles[1][1] + centerOfBoard[1], 150*scalingFactor)
                circle(fourthCircles[0][0] + centerOfBoard[0], fourthCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(fourthCircles[1][0] + centerOfBoard[0], fourthCircles[1][1] + centerOfBoard[1], 150*scalingFactor)

                noStroke()
                for (let i = mainBodyWidth - mainBodyWidth/10; i > 0; i -= mainBodyWidth / 100) {
                    fill(200, 40, 100, map(i, 0, mainBodyWidth, 0, 3))
                    circle(centerOfBoard[0], centerOfBoard[1], i)
                }
                fill(200, 40, 100, 30)
                circle(centerOfBoard[0], centerOfBoard[1], sin(frameCount/10)*mainBodyWidth/30 + mainBodyWidth/3)

                // only finish with this stage once everyone has
                // gotten into their positions
                if (((abs(realMT.x - MT[0]) < scalingFactor*2) && (abs(realMT.y - MT[1]) < scalingFactor*2)) &&
                    ((abs(realOT.x - OT[0]) < scalingFactor*2) && (abs(realOT.y - OT[1]) < scalingFactor*2)) &&
                    ((abs(realH1.x - H1[0]) < scalingFactor*2) && (abs(realH1.y - H1[1]) < scalingFactor*2)) &&
                    ((abs(realH2.x - H2[0]) < scalingFactor*2) && (abs(realH2.y - H2[1]) < scalingFactor*2)) &&
                    ((abs(realM1.x - M1[0]) < scalingFactor*2) && (abs(realM1.y - M1[1]) < scalingFactor*2)) &&
                    ((abs(realM2.x - M2[0]) < scalingFactor*2) && (abs(realM2.y - M2[1]) < scalingFactor*2)) &&
                    ((abs(realR1.x - R1[0]) < scalingFactor*2) && (abs(realR1.y - R1[1]) < scalingFactor*2)) &&
                    ((abs(realR2.x - R2[0]) < scalingFactor*2) && (abs(realR2.y - R2[1]) < scalingFactor*2))) {
                    stage = 4
                    textAtTop = "The knockback has resolved. Where do " +
                        "you rotate to? \nSelect the spot you will end up at" +
                        " the END, not which way you're rotating."

                    // display expanded star AoEs
                    if (inOrOut === "in") {
                        // intercardinal display
                        if (abs(firstCircles[0][0]) < 5*scalingFactor || abs(firstCircles[0][1]) < 5*scalingFactor) {
                            displayExpandedStarAoE(sqrt(2) * 1.05*mainBodyWidth / 12, sqrt(2) * 1.05*mainBodyWidth / 12)
                            displayExpandedStarAoE(sqrt(2) * 1.05*mainBodyWidth / 12, -sqrt(2) * 1.05*mainBodyWidth / 12)
                            displayExpandedStarAoE(-sqrt(2) * 1.05*mainBodyWidth / 12, -sqrt(2) * 1.05*mainBodyWidth / 12)
                            displayExpandedStarAoE(-sqrt(2) * 1.05*mainBodyWidth / 12, sqrt(2) * 1.05*mainBodyWidth / 12)
                        }
                        // cardinal display
                        if (abs(firstCircles[0][0]) > 5*scalingFactor && abs(firstCircles[0][1]) > 5*scalingFactor) {
                            displayExpandedStarAoE(1.05*mainBodyWidth / 6, 0)
                            displayExpandedStarAoE(0, -1.05*mainBodyWidth / 6)
                            displayExpandedStarAoE(-1.05*mainBodyWidth / 6, 0)
                            displayExpandedStarAoE(0, 1.05*mainBodyWidth / 6)
                        }
                    }
                    if (inOrOut === "out") {
                        // intercardinal display
                        if (abs(firstCircles[0][0]) < 5*scalingFactor || abs(firstCircles[0][1]) < 5*scalingFactor) {
                            displayExpandedStarAoE(sqrt(2) * 3*mainBodyWidth/14, sqrt(2) * 3*mainBodyWidth/14)
                            displayExpandedStarAoE(sqrt(2) * 3*mainBodyWidth/14, -sqrt(2) * 3*mainBodyWidth/14)
                            displayExpandedStarAoE(-sqrt(2) * 3*mainBodyWidth/14, -sqrt(2) * 3*mainBodyWidth/14)
                            displayExpandedStarAoE(-sqrt(2) * 3*mainBodyWidth/14, sqrt(2) * 3*mainBodyWidth/14)
                        }
                        // cardinal display
                        if (abs(firstCircles[0][0]) > 5*scalingFactor && abs(firstCircles[0][1]) > 5*scalingFactor) {
                            displayExpandedStarAoE(3*mainBodyWidth/7, 0)
                            displayExpandedStarAoE(0, -3*mainBodyWidth/7)
                            displayExpandedStarAoE(-3*mainBodyWidth/7, 0)
                            displayExpandedStarAoE(0, 3*mainBodyWidth/7)
                        }
                    }

                    frameRate(1)

                    // set the player targets
                    let firstLightPartyCircleAngle = (atan2(firstCircles[0][1], firstCircles[0][0]) + TWO_PI) % TWO_PI
                    let secondLightPartyCircleAngle = (firstLightPartyCircleAngle + PI) % TWO_PI
                    let spread = 15*scalingFactor
                    let radius = 17*mainBodyWidth/44
                    MT = [cos(firstLightPartyCircleAngle)*radius + spread/3, sin(firstLightPartyCircleAngle)*radius + spread]
                    H1 = [cos(firstLightPartyCircleAngle)*radius, sin(firstLightPartyCircleAngle)*radius]
                    M1 = [cos(firstLightPartyCircleAngle)*radius - spread, sin(firstLightPartyCircleAngle)*radius]
                    R1 = [cos(firstLightPartyCircleAngle)*radius + spread/3, sin(firstLightPartyCircleAngle)*radius - spread]
                    OT = [cos(secondLightPartyCircleAngle)*radius + spread, sin(secondLightPartyCircleAngle)*radius]
                    H2 = [cos(secondLightPartyCircleAngle)*radius, sin(secondLightPartyCircleAngle)*radius]
                    M2 = [cos(secondLightPartyCircleAngle)*radius - spread/3, sin(secondLightPartyCircleAngle)*radius + spread]
                    R2 = [cos(secondLightPartyCircleAngle)*radius - spread/3, sin(secondLightPartyCircleAngle)*radius - spread]
                }
            } if (stage === 4) {
                // display AoEs
                stroke(0, 0, 100)
                strokeWeight(2*scalingFactor)
                fill(200, 50, 100, 7.5)
                circle(thirdCircles[0][0] + centerOfBoard[0], thirdCircles[0][1] + centerOfBoard[1], 150*scalingFactor)
                circle(thirdCircles[1][0] + centerOfBoard[0], thirdCircles[1][1] + centerOfBoard[1], 150*scalingFactor)

                let yourposition = yourPosition()
                let angle = (degrees(atan2(yourposition[1], yourposition[0])) + 360) % 360
                let radius = sqrt(yourposition[1]**2 + yourposition[0]**2)
                let positions = []

                for (let greenDotAngle of [90, 157.5, 202.5, 270]) {
                    positions.push([cos(radians(angle + greenDotAngle))*radius + centerOfBoard[0], sin(radians(angle + greenDotAngle))*radius + centerOfBoard[1]])
                    displayGreenDot(cos(radians(angle + greenDotAngle))*radius, sin(radians(angle + greenDotAngle))*radius)
                }

                // also display Shiva at one of the positions
                displayShiva([cos(radians(spawnAngle))*mainBodyWidth/4, sin(radians(spawnAngle))*mainBodyWidth/4],
                    "clone", "", 20*scalingFactor)

                if (mousePressedButNotHeldDown()) {
                    let angleDiffFromShiva = (spawnAngle - angle + 540) % 360 - 180
                    if (inClickingRange([positions[0][0], positions[0][1]], 15*scalingFactor)) {
                        if (angleDiffFromShiva > -157.5 && angleDiffFromShiva < -22.5) {
                            stage = 4.1
                            textAtTop = "Dropping puddles and moving..."
                            textAtBottom = "You went to the position" +
                                " 90º counterclockwise of you. \n[PASS] —" +
                                " Shiva is 90º counterclockwise of you."

                            // the light party you are in will move
                            // 82.5º clockwise. the other will move
                            // 82.5º counterclockwise
                            setMovementMode("Radial")
                            if (lightParty() === 1) {
                                let newPositions = []
                                for (let position of [H1, M1, R1, MT]) {
                                    radius = sqrt(position[0]**2 + position[1]**2)
                                    angle = atan2(position[1], position[0])
                                    newPositions.push(
                                        [cos(angle + radians(82.5))*radius,
                                            sin(angle + radians(82.5))*radius])
                                } for (let position of [H2, M2, R2, OT]) {
                                    radius = sqrt(position[0]**2 + position[1]**2)
                                    angle = atan2(position[1], position[0])
                                    newPositions.push(
                                        [cos(angle + radians(-82.5))*radius,
                                            sin(angle + radians(-82.5))*radius])
                                }
                                H1 = newPositions[0]
                                M1 = newPositions[1]
                                R1 = newPositions[2]
                                MT = newPositions[3]
                                H2 = newPositions[4]
                                M2 = newPositions[5]
                                R2 = newPositions[6]
                                OT = newPositions[7]
                            } if (lightParty() === 2) {
                                let newPositions = []
                                for (let position of [H1, M1, R1, MT]) {
                                    radius = sqrt(position[0]**2 + position[1]**2)
                                    angle = atan2(position[1], position[0])
                                    newPositions.push(
                                        [cos(angle + radians(-82.5))*radius,
                                            sin(angle + radians(-82.5))*radius])
                                } for (let position of [H2, M2, R2, OT]) {
                                    radius = sqrt(position[0]**2 + position[1]**2)
                                    angle = atan2(position[1], position[0])
                                    newPositions.push(
                                        [cos(angle + radians(82.5))*radius,
                                            sin(angle + radians(82.5))*radius])
                                }
                                H1 = newPositions[0]
                                M1 = newPositions[1]
                                R1 = newPositions[2]
                                MT = newPositions[3]
                                H2 = newPositions[4]
                                M2 = newPositions[5]
                                R2 = newPositions[6]
                                OT = newPositions[7]
                            }
                        } else {
                            stage = 100
                            updateLosses(2)
                            textAtTop = "You are supposed to rotate away" +
                                " from Shiva. If it's a cursed pattern, you" +
                                " will want to rotate as\nfar clockwise as" +
                                " you can."
                            textAtBottom = "You rotated 90º clockwise. \n" +
                                "[FAIL] — Shiva is not counterclockwise of you."
                        }
                    } if (inClickingRange([positions[1][0], positions[1][1]], 15*scalingFactor)) {
                        if ((angleDiffFromShiva > -22.5 && angleDiffFromShiva < 22.5) ||
                            angleDiffFromShiva < -157.5 || angleDiffFromShiva > 157.5) {
                            stage = 4.1
                            textAtTop = "Dropping puddles and moving..."
                            textAtBottom = "You went as far clockwise as you" +
                                " can. \n[PASS] — It is a cursed pattern."

                            // both light parties will rotate 157.5º clockwise.
                            setMovementMode("Radial")
                            let newPositions = []
                            for (let position of [H1, M1, R1, MT]) {
                                radius = sqrt(position[0]**2 + position[1]**2)
                                angle = atan2(position[1], position[0])
                                newPositions.push(
                                    [cos(angle + radians(157.5))*radius,
                                        sin(angle + radians(157.5))*radius])
                            } for (let position of [H2, M2, R2, OT]) {
                                radius = sqrt(position[0]**2 + position[1]**2)
                                angle = atan2(position[1], position[0])
                                newPositions.push(
                                    [cos(angle + radians(157.5))*radius,
                                        sin(angle + radians(157.5))*radius])
                            }
                            H1 = newPositions[0]
                            M1 = newPositions[1]
                            R1 = newPositions[2]
                            MT = newPositions[3]
                            H2 = newPositions[4]
                            M2 = newPositions[5]
                            R2 = newPositions[6]
                            OT = newPositions[7]
                        } else {
                            stage = 100
                            updateLosses(2)
                            textAtTop = "This position is only okay if Shiva" +
                                " is on top of one of the groups."
                            textAtBottom = "You went as far clockwise as you" +
                                " can. \n[FAIL] — It's not a cursed pattern."
                        }
                    } if (inClickingRange([positions[2][0], positions[2][1]], 15*scalingFactor)) {
                        stage = 100
                        updateLosses(2)
                        textAtTop = "You are never supposed to go 157.5º" +
                            " counterclockwise. In case it is a cursed" +
                            " pattern, you're supposed \nto rotate clockwise," +
                            " not counterclockwise."
                        textAtBottom = "You went 22.5º clockwise of the" +
                            " other group. \n[FAIL] — This location is never" +
                            " correct."
                    } if (inClickingRange([positions[3][0], positions[3][1]], 15*scalingFactor)) {
                        if (angleDiffFromShiva > 22.5 && angleDiffFromShiva < 157.5) {
                            stage = 4.1
                            textAtTop = "Dropping puddles and moving..."
                            textAtBottom = "You went to the position" +
                                " 90º counterclockwise of you. \n[PASS] —" +
                                " Shiva is clockwise of you."
                            // the light party you are in will move
                            // 82.5º clockwise. the other will move
                            // 82.5º counterclockwise
                            setMovementMode("Radial")
                            if (lightParty() === 1) {
                                let newPositions = []
                                for (let position of [H1, M1, R1, MT]) {
                                    radius = sqrt(position[0]**2 + position[1]**2)
                                    angle = atan2(position[1], position[0])
                                    newPositions.push(
                                        [cos(angle + radians(-82.5))*radius,
                                            sin(angle + radians(-82.5))*radius])
                                } for (let position of [H2, M2, R2, OT]) {
                                    radius = sqrt(position[0]**2 + position[1]**2)
                                    angle = atan2(position[1], position[0])
                                    newPositions.push(
                                        [cos(angle + radians(82.5))*radius,
                                            sin(angle + radians(82.5))*radius])
                                }
                                H1 = newPositions[0]
                                M1 = newPositions[1]
                                R1 = newPositions[2]
                                MT = newPositions[3]
                                H2 = newPositions[4]
                                M2 = newPositions[5]
                                R2 = newPositions[6]
                                OT = newPositions[7]
                            } if (lightParty() === 2) {
                                let newPositions = []
                                for (let position of [H1, M1, R1, MT]) {
                                    radius = sqrt(position[0]**2 + position[1]**2)
                                    angle = atan2(position[1], position[0])
                                    newPositions.push(
                                        [cos(angle + radians(82.5))*radius,
                                            sin(angle + radians(82.5))*radius])
                                } for (let position of [H2, M2, R2, OT]) {
                                    radius = sqrt(position[0]**2 + position[1]**2)
                                    angle = atan2(position[1], position[0])
                                    newPositions.push(
                                        [cos(angle + radians(-82.5))*radius,
                                            sin(angle + radians(-82.5))*radius])
                                }
                                H1 = newPositions[0]
                                M1 = newPositions[1]
                                R1 = newPositions[2]
                                MT = newPositions[3]
                                H2 = newPositions[4]
                                M2 = newPositions[5]
                                R2 = newPositions[6]
                                OT = newPositions[7]
                            }
                        } else {
                            stage = 100
                            updateLosses(2)
                            textAtTop = "You are supposed to rotate away" +
                                " from Shiva. Even if it is a cursed" +
                                " pattern, this is the \nwrong way to rotate."
                            textAtBottom = "You went to the position" +
                                " 90º counterclockwise of you. \n[FAIL] —" +
                                " Shiva is not clockwise of you."
                        }
                    }
                    return
                }
            } if (stage > 4.09 && stage < 4.75) {
                // tint(0, 0, 100, 10)
                // image(fruP2IceFloor, centerOfBoard[0] - mainBodyWidth/2 + 20*scalingFactor, centerOfBoard[1] - mainBodyWidth/2 + 20*scalingFactor,
                //     mainBodyWidth - 40*scalingFactor, mainBodyWidth - 40*scalingFactor)

                // attempt at shine
                // fill(0, 0, 100, 20)
                // noStroke()
                // beginShape()
                // let topLeft = map((frameCount/scalingFactor*6) % (mainBodyWidth*2 + 100) - 100*scalingFactor, 0, mainBodyWidth*2, 0, mainBodyWidth*2, true)
                // let bottomRight = map((frameCount/scalingFactor*6) % (mainBodyWidth*2 + 100), 0, mainBodyWidth*2, 0, mainBodyWidth*2, true)
                //
                // vertex(topLeft + centerOfBoard[0] - mainBodyWidth/2, centerOfBoard[1] - mainBodyWidth/2)
                // vertex(centerOfBoard[0] - mainBodyWidth/2, topLeft + centerOfBoard[1] - mainBodyWidth/2)
                // vertex(centerOfBoard[0] - mainBodyWidth/2, bottomRight + centerOfBoard[1] - mainBodyWidth/2)
                // vertex(bottomRight + centerOfBoard[0] - mainBodyWidth/2, centerOfBoard[1] - mainBodyWidth/2)
                // endShape(CLOSE)

                // also display Shiva at one of the positions
                displayShiva([cos(radians(spawnAngle))*mainBodyWidth/4, sin(radians(spawnAngle))*mainBodyWidth/4],
                    "clone", "", 15*scalingFactor)

                if ((stage > 4.0999 && stage < 4.101) || (stage > 4.125 && stage < 4.126) || (stage > 4.15 && stage < 4.151) || (stage > 4.175 && stage < 4.176)) {
                    puddles.push([realH1.x, realH1.y, millis(), 60*scalingFactor], [realH2.x, realH2.y, millis(), 60*scalingFactor])
                }
                stage += 0.001

                // once everyone's gotten close enough, advance to the next
                // stage
                if (((abs(realMT.x - MT[0]) < scalingFactor/2) && (abs(realMT.y - MT[1]) < scalingFactor/2)) &&
                    ((abs(realOT.x - OT[0]) < scalingFactor/2) && (abs(realOT.y - OT[1]) < scalingFactor/2)) &&
                    ((abs(realH1.x - H1[0]) < scalingFactor/2) && (abs(realH1.y - H1[1]) < scalingFactor/2)) &&
                    ((abs(realH2.x - H2[0]) < scalingFactor/2) && (abs(realH2.y - H2[1]) < scalingFactor/2)) &&
                    ((abs(realM1.x - M1[0]) < scalingFactor/2) && (abs(realM1.y - M1[1]) < scalingFactor/2)) &&
                    ((abs(realM2.x - M2[0]) < scalingFactor/2) && (abs(realM2.y - M2[1]) < scalingFactor/2)) &&
                    ((abs(realR1.x - R1[0]) < scalingFactor/2) && (abs(realR1.y - R1[1]) < scalingFactor/2)) &&
                    ((abs(realR2.x - R2[0]) < scalingFactor/2) && (abs(realR2.y - R2[1]) < scalingFactor/2))) {
                    erase()
                    rect(0, 0, width, height)
                    noErase()

                    stage = 4.75


                    tint(0, 0, 100, 90)
                    image(fruP2IceFloor, centerOfBoard[0] - mainBodyWidth/2 + 20*scalingFactor, centerOfBoard[1] - mainBodyWidth/2 + 20*scalingFactor,
                        mainBodyWidth - 40*scalingFactor, mainBodyWidth - 40*scalingFactor)
                    setMovementMode("Ice")
                    frameRate(1)

                    // if it's a cursed pattern, H1 or H2 should slide over.
                    // how do we determine whether it's a cursed pattern?
                    // if it is, H1 and H2 will be greater than 90º apart.
                    // how do we determine whether H1 or H2 slides over?
                    // whichever one is closer to Shiva slides over.
                    // how do we determine where they slide?
                    let H1Angle = atan2(H1[1], H1[0])
                    let H2Angle = atan2(H2[1], H2[0])
                    if (abs(H1Angle - H2Angle) % 360 > radians(90) &&
                        abs(H1Angle - H2Angle) % 360 < radians(270)) {
                        let distanceToSlide = mainBodyWidth*23/32
                        if (abs((H1Angle - radians(spawnAngle) + radians(540)) % radians(360) - radians(180)) < abs((H2Angle - radians(spawnAngle) + radians(540)) % radians(360) - radians(180))) {
                            H1 = [H1[0] + -cos(-radians(spawnAngle))*distanceToSlide, H1[1] + sin(-radians(spawnAngle))*distanceToSlide]
                            R1 = [R1[0] + -cos(-radians(spawnAngle))*distanceToSlide, R1[1] + sin(-radians(spawnAngle))*distanceToSlide]
                            M1 = [M1[0] + -cos(-radians(spawnAngle))*distanceToSlide, M1[1] + sin(-radians(spawnAngle))*distanceToSlide]
                            MT = [MT[0] + -cos(-radians(spawnAngle))*distanceToSlide, MT[1] + sin(-radians(spawnAngle))*distanceToSlide]
                        } else {
                            H2 = [H2[0] + -cos(-radians(spawnAngle))*distanceToSlide, H2[1] + sin(-radians(spawnAngle))*distanceToSlide]
                            R2 = [R2[0] + -cos(-radians(spawnAngle))*distanceToSlide, R2[1] + sin(-radians(spawnAngle))*distanceToSlide]
                            M2 = [M2[0] + -cos(-radians(spawnAngle))*distanceToSlide, M2[1] + sin(-radians(spawnAngle))*distanceToSlide]
                            OT = [OT[0] + -cos(-radians(spawnAngle))*distanceToSlide, OT[1] + sin(-radians(spawnAngle))*distanceToSlide]
                        }
                    }

                    puddles = [puddles[4], puddles[5], puddles[6], puddles[7]]
                }
            } if (stage === 4.75) {
                // display the ice floor!
                tint(0, 0, 100, 10)
                image(fruP2IceFloor, centerOfBoard[0] - mainBodyWidth/2 + 20*scalingFactor, centerOfBoard[1] - mainBodyWidth/2 + 20*scalingFactor,
                    mainBodyWidth - 40*scalingFactor, mainBodyWidth - 40*scalingFactor)

                // also display Shiva at one of the positions
                displayShiva([cos(radians(spawnAngle))*mainBodyWidth/4, sin(radians(spawnAngle))*mainBodyWidth/4],
                    "clone", "", 15*scalingFactor)

                // once everyone's gotten close enough, advance to the next
                // stage
                if (((abs(realMT.x - MT[0]) < scalingFactor/2) && (abs(realMT.y - MT[1]) < scalingFactor/2)) &&
                    ((abs(realOT.x - OT[0]) < scalingFactor/2) && (abs(realOT.y - OT[1]) < scalingFactor/2)) &&
                    ((abs(realH1.x - H1[0]) < scalingFactor/2) && (abs(realH1.y - H1[1]) < scalingFactor/2)) &&
                    ((abs(realH2.x - H2[0]) < scalingFactor/2) && (abs(realH2.y - H2[1]) < scalingFactor/2)) &&
                    ((abs(realM1.x - M1[0]) < scalingFactor/2) && (abs(realM1.y - M1[1]) < scalingFactor/2)) &&
                    ((abs(realM2.x - M2[0]) < scalingFactor/2) && (abs(realM2.y - M2[1]) < scalingFactor/2)) &&
                    ((abs(realR1.x - R1[0]) < scalingFactor/2) && (abs(realR1.y - R1[1]) < scalingFactor/2)) &&
                    ((abs(realR2.x - R2[0]) < scalingFactor/2) && (abs(realR2.y - R2[1]) < scalingFactor/2))) {
                    stage = 5
                    textAtTop = "Look at the message box on Shiva's head to" +
                        " figure out where to go. You're on thin ice" +
                        " here—so be\ncareful!"
                    textAtBottom = "Everyone's finished sliding. Speaking of" +
                        " which, have you ever tripped on ice before?"
                    puddles = [puddles[2], puddles[3]]
                }
            } if (stage === 5) {
                // display the ice floor!
                tint(0, 0, 100, 10)
                image(fruP2IceFloor, centerOfBoard[0] - mainBodyWidth/2 + 20*scalingFactor, centerOfBoard[1] - mainBodyWidth/2 + 20*scalingFactor,
                    mainBodyWidth - 40*scalingFactor, mainBodyWidth - 40*scalingFactor)

                // also display Shiva at one of the positions
                // the possible things she can say are "Sink into silence!"
                // or "In stillness freeze!"
                let textToDisplay
                if (silenceOrStillness === "silence") {
                    textToDisplay = "Sink into silence!"
                } if (silenceOrStillness === "stillness") {
                    textToDisplay = "In stillness freeze!"
                }
                displayShiva([cos(radians(spawnAngle))*mainBodyWidth/4, sin(radians(spawnAngle))*mainBodyWidth/4],
                    "boss", textToDisplay, 15*scalingFactor)

                // display the green dots: where you are, and behind Shiva
                let yourPositionDot = [yourPosition()[0] + centerOfBoard[0], yourPosition()[1] + centerOfBoard[1]]
                displayGreenDot(yourPosition()[0], yourPosition()[1]) // yourPosition() returns a list
                let behindShiva = [cos(radians(spawnAngle))*mainBodyWidth*3/8 + centerOfBoard[0], sin(radians(spawnAngle))*mainBodyWidth*3/8 + centerOfBoard[1]]
                displayGreenDot(cos(radians(spawnAngle))*mainBodyWidth*3/8, sin(radians(spawnAngle))*mainBodyWidth*3/8)

                if (mousePressedButNotHeldDown()) {
                    if (inClickingRange(yourPositionDot, 15*scalingFactor)) {
                        if (silenceOrStillness === "silence") {
                            // correct!
                            textAtTop = "Just a little more animations and" +
                                " you'll be there!"
                            textAtBottom = "You stayed where you are." +
                                " \n[PASS] — It's a behind cleave."
                            stage = 5.5
                        } else {
                            // incorrect!
                            textAtTop = "This is a 270º cleave in front of" +
                                " Shiva. You'd rather stay where you are."
                            textAtBottom = "You stayed where you are." +
                                " \n[FAIL] — It's a front cleave."
                            stage = 100
                            updateLosses(2)
                        }
                    } if (inClickingRange(behindShiva, 15*scalingFactor)) {
                        if (silenceOrStillness === "stillness") {
                            // correct!
                            textAtTop = "Just a little more animations and" +
                                " you'll be there!"
                            textAtBottom = "You slid over." +
                                " \n[PASS] — It's a front cleave."
                            stage = 5.5

                            // time to slide over! all people slide in
                            // Shiva's direction
                            let shivaPosition =
                                [cos(radians(spawnAngle))*mainBodyWidth/4, sin(radians(spawnAngle))*mainBodyWidth/4]
                            let slidingDistance = mainBodyWidth*3/4
                            let newPositions = []
                            for (let position of [MT, OT, H1, H2, M1, M2, R1, R2]) {
                                let slidingAngle = atan2(shivaPosition[1] - position[1], shivaPosition[0] - position[0])
                                newPositions.push([position[0] + cos(slidingAngle)*slidingDistance,
                                    position[1] + sin(slidingAngle)*slidingDistance])
                            }
                            MT = newPositions[0]
                            OT = newPositions[1]
                            H1 = newPositions[2]
                            H2 = newPositions[3]
                            M1 = newPositions[4]
                            M2 = newPositions[5]
                            R1 = newPositions[6]
                            R2 = newPositions[7]
                        } else {
                            // incorrect!
                            textAtTop = "This is a 90º cleave behind of" +
                                " Shiva. You'd rather stay where you are."
                            textAtBottom = "You slid over." +
                                " \n[FAIL] — It's a behind cleave."
                            stage = 100
                            updateLosses(2)
                        }
                    }
                    return
                }
            } if (stage === 5.5) {
                puddles = []
                // display the ice floor!
                tint(0, 0, 100, 10)
                image(fruP2IceFloor, centerOfBoard[0] - mainBodyWidth/2 + 20*scalingFactor, centerOfBoard[1] - mainBodyWidth/2 + 20*scalingFactor,
                    mainBodyWidth - 40*scalingFactor, mainBodyWidth - 40*scalingFactor)

                displayShiva([cos(radians(spawnAngle))*mainBodyWidth/4, sin(radians(spawnAngle))*mainBodyWidth/4],
                    "boss", "", 15*scalingFactor)
                if (((abs(realMT.x - MT[0]) < scalingFactor/2) && (abs(realMT.y - MT[1]) < scalingFactor/2)) &&
                    ((abs(realOT.x - OT[0]) < scalingFactor/2) && (abs(realOT.y - OT[1]) < scalingFactor/2)) &&
                    ((abs(realH1.x - H1[0]) < scalingFactor/2) && (abs(realH1.y - H1[1]) < scalingFactor/2)) &&
                    ((abs(realH2.x - H2[0]) < scalingFactor/2) && (abs(realH2.y - H2[1]) < scalingFactor/2)) &&
                    ((abs(realM1.x - M1[0]) < scalingFactor/2) && (abs(realM1.y - M1[1]) < scalingFactor/2)) &&
                    ((abs(realM2.x - M2[0]) < scalingFactor/2) && (abs(realM2.y - M2[1]) < scalingFactor/2)) &&
                    ((abs(realR1.x - R1[0]) < scalingFactor/2) && (abs(realR1.y - R1[1]) < scalingFactor/2)) &&
                    ((abs(realR2.x - R2[0]) < scalingFactor/2) && (abs(realR2.y - R2[1]) < scalingFactor/2))) {
                    stage = 5.75

                    // time to slide over! all people slide in
                    // Shiva's direction
                    let shivaPosition =
                        [cos(radians(spawnAngle))*mainBodyWidth/4, sin(radians(spawnAngle))*mainBodyWidth/4]
                    let slidingDistance = mainBodyWidth*3/4
                    let newPositions = []
                    for (let position of [MT, OT, H1, H2, M1, M2, R1, R2]) {
                        let slidingAngle = atan2(shivaPosition[1] - position[1], shivaPosition[0] - position[0])
                        newPositions.push([position[0] + cos(slidingAngle)*slidingDistance,
                            position[1] + sin(slidingAngle)*slidingDistance])
                    }
                    MT = newPositions[0]
                    OT = newPositions[1]
                    H1 = newPositions[2]
                    H2 = newPositions[3]
                    M1 = newPositions[4]
                    M2 = newPositions[5]
                    R1 = newPositions[6]
                    R2 = newPositions[7]

                    // also display the AoE
                    frameRate(1)
                    fill(192, 74, 91)
                    noStroke()
                    push()
                    translateToCenterOfBoard()
                    translate(shivaPosition[0], shivaPosition[1])
                    rotate(radians(spawnAngle - 45))
                    if (silenceOrStillness === "silence") {
                        rect(0, 0, width, height)
                    } else {
                        rect(0, 0, -width, height)
                        rect(0, 0, -width, -height)
                        rect(0, 0, width, -height)
                    }
                    pop()
                }
            } if (stage === 5.75) {
                // display the ice floor!
                tint(0, 0, 100, 10)
                image(fruP2IceFloor, centerOfBoard[0] - mainBodyWidth/2 + 20*scalingFactor, centerOfBoard[1] - mainBodyWidth/2 + 20*scalingFactor,
                    mainBodyWidth - 40*scalingFactor, mainBodyWidth - 40*scalingFactor)

                displayShiva([cos(radians(spawnAngle))*mainBodyWidth/4, sin(radians(spawnAngle))*mainBodyWidth/4],
                    "boss", "", 15*scalingFactor)
                if (((abs(realMT.x - MT[0]) < scalingFactor/2) && (abs(realMT.y - MT[1]) < scalingFactor/2)) &&
                    ((abs(realOT.x - OT[0]) < scalingFactor/2) && (abs(realOT.y - OT[1]) < scalingFactor/2)) &&
                    ((abs(realH1.x - H1[0]) < scalingFactor/2) && (abs(realH1.y - H1[1]) < scalingFactor/2)) &&
                    ((abs(realH2.x - H2[0]) < scalingFactor/2) && (abs(realH2.y - H2[1]) < scalingFactor/2)) &&
                    ((abs(realM1.x - M1[0]) < scalingFactor/2) && (abs(realM1.y - M1[1]) < scalingFactor/2)) &&
                    ((abs(realM2.x - M2[0]) < scalingFactor/2) && (abs(realM2.y - M2[1]) < scalingFactor/2)) &&
                    ((abs(realR1.x - R1[0]) < scalingFactor/2) && (abs(realR1.y - R1[1]) < scalingFactor/2)) &&
                    ((abs(realR2.x - R2[0]) < scalingFactor/2) && (abs(realR2.y - R2[1]) < scalingFactor/2))) {
                    stage = 99
                    textAtTop = "Congrats! You made it! Note: This mechanic" +
                        " is kind of long."
                    textAtBottom = `[CLEARED, ${formatSeconds((millis() - mechanicStarted)/1000)}]`
                    updateWins(2)

                    // time to slide over! all people slide in
                    // Shiva's direction
                    let shivaPosition =
                        [cos(radians(spawnAngle))*mainBodyWidth/4, sin(radians(spawnAngle))*mainBodyWidth/4]

                    // also display the AoE
                    frameRate(1)
                    fill(192, 74, 91)
                    noStroke()
                    push()
                    translateToCenterOfBoard()
                    translate(shivaPosition[0], shivaPosition[1])
                    rotate(radians(spawnAngle - 45))
                    if (silenceOrStillness === "stillness") {
                        rect(0, 0, width, height)
                    } else {
                        rect(0, 0, -width, height)
                        rect(0, 0, -width, -height)
                        rect(0, 0, width, -height)
                    }
                    pop()
                }
            }
            for (let puddle of puddles) {
                displayPuddle(puddle)
            }
        }
        if (currentlySelectedMechanic === "Mirror Mirror") {
            let mirrorRadius = mainBodyWidth/2 - 20*scalingFactor
            let mirrorSize = 60*scalingFactor

            if (stage === 0) {
                // draw a mirror mirror! 60*scalingFactor width
                tint(200, 50, 100, 20)
                let mirrorLocation = [
                    cos(radians(blueMirrorAngle))*mirrorRadius + centerOfBoard[0],
                    sin(radians(blueMirrorAngle))*mirrorRadius + centerOfBoard[1]]
                image(mirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)

                let greenDotRadius = 3*mainBodyWidth/8
                let correctRangedGreenDotPosition = []
                let correctMeleeGreenDotPosition = []
                let incorrectGreenDots = []

                // make sure that blue mirror angle is positive
                let realBlueMirrorAngle = (blueMirrorAngle + 36000000000000) % 360

                for (let angle of [0, 45, 90, 135, 180, 225, 270, 315]) {
                    let x = cos(radians(angle))*greenDotRadius
                    let y = sin(radians(angle))*greenDotRadius
                    displayGreenDot(x, y)

                    let atBlueMirror = abs(angle - realBlueMirrorAngle) < 22.5 || abs(angle - realBlueMirrorAngle) > 337.5
                    let awayFromBlueMirror = abs(angle - realBlueMirrorAngle) > 157.5 && abs(angle - realBlueMirrorAngle) < 202.5
                    if (atBlueMirror) {
                        correctRangedGreenDotPosition = [x + centerOfBoard[0], y + centerOfBoard[1]]
                    } else if (awayFromBlueMirror) {
                        correctMeleeGreenDotPosition = [x + centerOfBoard[0], y + centerOfBoard[1]]
                    } else {
                        incorrectGreenDots.push([x + centerOfBoard[0], y + centerOfBoard[1]])
                    }
                }

                if (mousePressedButNotHeldDown()) {
                    if (inClickingRange(correctRangedGreenDotPosition, 15*scalingFactor)) {
                        if (meleeOrRanged(role) === "ranged") {
                            stage = 0.5
                            textAtTop = "You have gone into the correct" +
                                " spot. Now you need to bait your blue" +
                                " mirror properly."
                            textAtBottom = "You went at the blue mirror." +
                                " \n[PASS] — You went to the blue mirror." +
                                " \n[PASS] — You are a ranged."
                        } else {
                            stage = 100
                            updateLosses(3)
                            textAtTop = "If you are a melee, you must go" +
                                " opposite the blue mirror. Usually the" +
                                " tanks pull the boss opposite the \nmirror," +
                                " though it always helps to do it yourself."
                            textAtBottom = "You went at the blue mirror." +
                                " \n[PASS] — You went to the blue mirror." +
                                " \n[FAIL] — You are a melee."
                        }
                    } if (inClickingRange(correctMeleeGreenDotPosition, 15*scalingFactor)) {
                        if (meleeOrRanged(role) === "melee") {
                            stage = 0.5
                            textAtTop = "You have gone into the correct" +
                                " spot. Now you need to bait the boss properly."
                            textAtBottom = "You went opposite the blue" +
                                " mirror. \n[PASS] — You went opposite the" +
                                " blue mirror. \n[PASS] — You are a melee."
                        } else {
                            stage = 100
                            updateLosses(3)
                            textAtTop = "If you are a ranged, you must go" +
                                " towards the blue mirror. I don't recommend" +
                                " following another ranged."
                            textAtBottom = "You went opposite the blue" +
                                " mirror. \n[PASS] — You went opposite the" +
                                " blue mirror. \n[FAIL] — You are a ranged."
                        }
                    } if (inClickingRanges(incorrectGreenDots, 15*scalingFactor)) {
                        stage = 100
                        updateLosses(3)
                        textAtTop = "You should always start at or opposite" +
                            " the blue mirror. The blue mirror partially covers" +
                            " the notch."
                        textAtBottom = "You went neither opposite nor at the" +
                            " blue mirror. \n[FAIL] — You did not go at or" +
                            " opposite the blue mirror."
                    }
                }
            } if (stage === 0.5) {
                // draw a mirror mirror! 60*scalingFactor width
                tint(200, 50, 100, 20)
                let mirrorLocation = [
                    cos(radians(blueMirrorAngle))*mirrorRadius + centerOfBoard[0],
                    sin(radians(blueMirrorAngle))*mirrorRadius + centerOfBoard[1]]
                image(mirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)

                // this is a 1-frame, intermediate stage
                stage = 1

                // just make people arrive to their spots
                let radius = mainBodyWidth/3
                MT = [cos(radians(blueMirrorAngle - 180 + random(-10, 10)))*radius, sin(radians(blueMirrorAngle - 180 + random(-10, 10)))*radius]
                OT = [cos(radians(blueMirrorAngle - 180 + random(-10, 10)))*radius, sin(radians(blueMirrorAngle - 180 + random(-10, 10)))*radius]
                M1 = [cos(radians(blueMirrorAngle - 180 + random(-10, 10)))*radius, sin(radians(blueMirrorAngle - 180 + random(-10, 10)))*radius]
                M2 = [cos(radians(blueMirrorAngle - 180 + random(-10, 10)))*radius, sin(radians(blueMirrorAngle - 180 + random(-10, 10)))*radius]
                H1 = [cos(radians(blueMirrorAngle + random(-10, 10)))*radius, sin(radians(blueMirrorAngle + random(-10, 10)))*radius]
                H2 = [cos(radians(blueMirrorAngle + random(-10, 10)))*radius, sin(radians(blueMirrorAngle + random(-10, 10)))*radius]
                R1 = [cos(radians(blueMirrorAngle + random(-10, 10)))*radius, sin(radians(blueMirrorAngle + random(-10, 10)))*radius]
                R2 = [cos(radians(blueMirrorAngle + random(-10, 10)))*radius, sin(radians(blueMirrorAngle + random(-10, 10)))*radius]
            } if (stage === 1) {
                // draw a mirror mirror! 60*scalingFactor width
                tint(200, 50, 100, 20)
                let mirrorLocation = [
                    cos(radians(blueMirrorAngle))*mirrorRadius + centerOfBoard[0],
                    sin(radians(blueMirrorAngle))*mirrorRadius + centerOfBoard[1]]
                image(mirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)

                let shivaRadius = mainBodyWidth/4
                displayShiva([cos(radians(blueMirrorAngle - 180))*shivaRadius,
                    sin(radians(blueMirrorAngle - 180))*shivaRadius], "boss", "Reap!", 15*scalingFactor)

                let H1Spot = [
                    cos(radians(blueMirrorAngle - 10))*(mirrorRadius - 5*scalingFactor) + centerOfBoard[0],
                    sin(radians(blueMirrorAngle - 10))*(mirrorRadius - 5*scalingFactor) + centerOfBoard[1]
                ]
                let H2Spot = [
                    cos(radians(blueMirrorAngle + 10))*(mirrorRadius - 5*scalingFactor) + centerOfBoard[0],
                    sin(radians(blueMirrorAngle + 10))*(mirrorRadius - 5*scalingFactor) + centerOfBoard[1]
                ]
                let R1Spot = [
                    cos(radians(blueMirrorAngle - 7))*(mirrorRadius - 20*scalingFactor) + centerOfBoard[0],
                    sin(radians(blueMirrorAngle - 7))*(mirrorRadius - 20*scalingFactor) + centerOfBoard[1]
                ]
                let R2Spot = [
                    cos(radians(blueMirrorAngle + 7))*(mirrorRadius - 20*scalingFactor) + centerOfBoard[0],
                    sin(radians(blueMirrorAngle + 7))*(mirrorRadius - 20*scalingFactor) + centerOfBoard[1]
                ]
                let OTSpot = [
                    cos(radians(blueMirrorAngle - 167))*(shivaRadius + 20*scalingFactor) + centerOfBoard[0],
                    sin(radians(blueMirrorAngle - 167))*(shivaRadius + 20*scalingFactor) + centerOfBoard[1]
                ]
                let MTSpot = [
                    cos(radians(blueMirrorAngle - 193))*(shivaRadius + 20*scalingFactor) + centerOfBoard[0],
                    sin(radians(blueMirrorAngle - 193))*(shivaRadius + 20*scalingFactor) + centerOfBoard[1]
                ]
                let M2Spot = [
                    cos(radians(blueMirrorAngle - 160))*(shivaRadius - 20*scalingFactor) + centerOfBoard[0],
                    sin(radians(blueMirrorAngle - 160))*(shivaRadius - 20*scalingFactor) + centerOfBoard[1]
                ]
                let M1Spot = [
                    cos(radians(blueMirrorAngle - 200))*(shivaRadius - 20*scalingFactor) + centerOfBoard[0],
                    sin(radians(blueMirrorAngle - 200))*(shivaRadius - 20*scalingFactor) + centerOfBoard[1]
                ]

                // of course, the positions are wildly different between melee and ranged
                if (meleeOrRanged(role) === "ranged") {
                    displaySmallGreenDot(H1Spot[0] - centerOfBoard[0], H1Spot[1] - centerOfBoard[1])
                    displaySmallGreenDot(H2Spot[0] - centerOfBoard[0], H2Spot[1] - centerOfBoard[1])
                    displaySmallGreenDot(R1Spot[0] - centerOfBoard[0], R1Spot[1] - centerOfBoard[1])
                    displaySmallGreenDot(R2Spot[0] - centerOfBoard[0], R2Spot[1] - centerOfBoard[1])

                    if (mousePressedButNotHeldDown()) {
                        if (inClickingRange(H1Spot, 7*scalingFactor)) {
                            textAtTop = ""
                            textAtBottom = "You went to H1's spot."
                            if (lightParty() === 1) {
                                textAtBottom += "\n[PASS] — You're light party 1."
                            } else {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're light party 2."
                                textAtTop = "Light party 1 is left facing the" +
                                    " wall. Light party 2 is right facing the" +
                                    " wall.\n"
                            }
                            if (DPSOrSupports(role) === "supports") {
                                textAtBottom += "\n[PASS] — You're a support."
                            } else {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're a DPS."
                                textAtTop += "Supports are closer to the wall" +
                                    " than DPS."
                            }
                            if (stage !== 100) stage = 1.25
                            else updateLosses(3)
                        }
                        if (inClickingRange(H2Spot, 7*scalingFactor)) {
                            textAtTop = ""
                            textAtBottom = "You went to H2's spot."
                            if (lightParty() === 1) {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're light party 1."
                                textAtTop = "Light party 1 is left facing the" +
                                    " wall. Light party 2 is right facing the" +
                                    " wall.\n"
                            } else {
                                textAtBottom += "\n[PASS] — You're light party 2."
                            }
                            if (DPSOrSupports(role) === "supports") {
                                textAtBottom += "\n[PASS] — You're a support."
                            } else {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're a DPS."
                                textAtTop += "Supports are closer to the wall" +
                                    " than DPS."
                            }
                            if (stage !== 100) stage = 1.25
                            else updateLosses(3)
                        }
                        if (inClickingRange(R1Spot, 7*scalingFactor)) {
                            textAtTop = ""
                            textAtBottom = "You went to R1's spot."
                            if (lightParty() === 1) {
                                textAtBottom += "\n[PASS] — You're light party 1."
                            } else {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're light party 2."
                                textAtTop = "Light party 1 is left facing the" +
                                    " wall. Light party 2 is right facing the" +
                                    " wall.\n"
                            }
                            if (DPSOrSupports(role) === "supports") {
                                textAtBottom += "\n[FAIL] — You're a support."
                                stage = 100
                                textAtTop += "Supports are closer to the wall" +
                                    " than DPS."
                            } else {
                                textAtBottom += "\n[PASS] — You're a DPS."
                            }
                            if (stage !== 100) stage = 1.25
                            else updateLosses(3)
                        }
                        if (inClickingRange(R2Spot, 7*scalingFactor)) {
                            textAtTop = ""
                            textAtBottom = "You went to R2's spot."
                            if (lightParty() === 1) {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're light party 1."
                                textAtTop = "Light party 1 is left facing the" +
                                    " wall. Light party 2 is right facing the" +
                                    " wall.\n"
                            } else {
                                textAtBottom += "\n[PASS] — You're light party 2."
                            }
                            if (DPSOrSupports(role) === "supports") {
                                textAtBottom += "\n[FAIL] — You're a support."
                                stage = 100
                                textAtTop += "Supports are closer to the wall" +
                                    " than DPS."
                            } else {
                                textAtBottom += "\n[PASS] — You're a DPS."
                            }
                            if (stage !== 100) stage = 1.25
                            else updateLosses(3)
                        }
                    }
                } if (meleeOrRanged(role) === "melee") {
                    displaySmallGreenDot(MTSpot[0] - centerOfBoard[0], MTSpot[1] - centerOfBoard[1])
                    displaySmallGreenDot(OTSpot[0] - centerOfBoard[0], OTSpot[1] - centerOfBoard[1])
                    displaySmallGreenDot(M1Spot[0] - centerOfBoard[0], M1Spot[1] - centerOfBoard[1])
                    displaySmallGreenDot(M2Spot[0] - centerOfBoard[0], M2Spot[1] - centerOfBoard[1])
                    if (mousePressedButNotHeldDown()) {
                        if (inClickingRange(MTSpot, 7*scalingFactor)) {
                            textAtTop = ""
                            textAtBottom = "You went to MT's spot."
                            if (lightParty() === 1) {
                                textAtBottom += "\n[PASS] — You're light party 1."
                            } else {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're light party 2."
                                textAtTop = "Light party 1 is left facing the" +
                                    " wall. Light party 2 is right facing the" +
                                    " wall.\n"
                            }
                            if (DPSOrSupports(role) === "supports") {
                                textAtBottom += "\n[PASS] — You're a support."
                            } else {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're a DPS."
                                textAtTop += "Supports are closer to the wall" +
                                    " than DPS."
                                if (stage !== 100) stage = 1.25
                                else updateLosses(3)
                            }
                        }
                        if (inClickingRange(OTSpot, 10*scalingFactor)) {
                            textAtTop = ""
                            textAtBottom = "You went to OT's spot."
                            if (lightParty() === 1) {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're light party 1."
                                textAtTop = "Light party 1 is left facing the" +
                                    " wall. Light party 2 is right facing the" +
                                    " wall.\n"
                            } else {
                                textAtBottom += "\n[PASS] — You're light party 2."
                            }
                            if (DPSOrSupports(role) === "supports") {
                                textAtBottom += "\n[PASS] — You're a support."
                            } else {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're a DPS."
                                textAtTop += "Supports are closer to the wall" +
                                    " than DPS."
                                if (stage !== 100) stage = 1.25
                                else updateLosses(3)
                            }
                        }
                        if (inClickingRange(M1Spot, 10*scalingFactor)) {
                            textAtTop = ""
                            textAtBottom = "You went to M1's spot."
                            if (lightParty() === 1) {
                                textAtBottom += "\n[PASS] — You're light party 1."
                            } else {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're light party 2."
                                textAtTop = "Light party 1 is left facing the" +
                                    " wall. Light party 2 is right facing the" +
                                    " wall.\n"
                            }
                            if (DPSOrSupports(role) === "supports") {
                                textAtBottom += "\n[FAIL] — You're a support."
                                stage = 100
                                textAtTop += "Supports are closer to the wall" +
                                    " than DPS."
                            } else {
                                textAtBottom += "\n[PASS] — You're a DPS."
                            }
                            if (stage !== 100) stage = 1.25
                            else updateLosses(3)
                        }
                        if (inClickingRange(M2Spot, 7*scalingFactor)) {
                            textAtTop = ""
                            textAtBottom = "You went to M2's spot."
                            if (lightParty() === 1) {
                                stage = 100
                                textAtBottom += "\n[FAIL] — You're light party 1."
                                textAtTop = "Light party 1 is left facing the" +
                                    " wall. Light party 2 is right facing the" +
                                    " wall.\n"
                            } else {
                                textAtBottom += "\n[PASS] — You're light party 2."
                            }
                            if (DPSOrSupports(role) === "supports") {
                                textAtBottom += "\n[FAIL] — You're a support."
                                stage = 100
                                textAtTop += "Supports are closer to the wall" +
                                    " than DPS."
                            } else {
                                textAtBottom += "\n[PASS] — You're a DPS."
                            }
                            if (stage !== 100) stage = 1.25
                            else updateLosses(3)
                        }
                    }
                }
            } if (stage === 1.25) {
                let shivaRadius = mainBodyWidth/4
                displayShiva([cos(radians(blueMirrorAngle - 180))*shivaRadius,
                    sin(radians(blueMirrorAngle - 180))*shivaRadius], "boss", "Reap!", 15*scalingFactor)
                H1 = [
                    cos(radians(blueMirrorAngle - 10))*(mirrorRadius - 5*scalingFactor),
                    sin(radians(blueMirrorAngle - 10))*(mirrorRadius - 5*scalingFactor)
                ]
                H2 = [
                    cos(radians(blueMirrorAngle + 10))*(mirrorRadius - 5*scalingFactor),
                    sin(radians(blueMirrorAngle + 10))*(mirrorRadius - 5*scalingFactor)
                ]
                R1 = [
                    cos(radians(blueMirrorAngle - 7))*(mirrorRadius - 20*scalingFactor),
                    sin(radians(blueMirrorAngle - 7))*(mirrorRadius - 20*scalingFactor)
                ]
                R2 = [
                    cos(radians(blueMirrorAngle + 7))*(mirrorRadius - 20*scalingFactor),
                    sin(radians(blueMirrorAngle + 7))*(mirrorRadius - 20*scalingFactor)
                ]
                MT = [
                    cos(radians(blueMirrorAngle - 167))*(shivaRadius + 20*scalingFactor),
                    sin(radians(blueMirrorAngle - 167))*(shivaRadius + 20*scalingFactor)
                ]
                OT = [
                    cos(radians(blueMirrorAngle - 193))*(shivaRadius + 20*scalingFactor),
                    sin(radians(blueMirrorAngle - 193))*(shivaRadius + 20*scalingFactor)
                ]
                M1 = [
                    cos(radians(blueMirrorAngle - 160))*(shivaRadius - 20*scalingFactor),
                    sin(radians(blueMirrorAngle - 160))*(shivaRadius - 20*scalingFactor)
                ]
                M2 = [
                    cos(radians(blueMirrorAngle - 200))*(shivaRadius - 20*scalingFactor),
                    sin(radians(blueMirrorAngle - 200))*(shivaRadius - 20*scalingFactor)
                ]
                textAtTop = "Which red mirror should you go to?"
                stage = 1.5
            } if (stage === 1.5) {
                // draw a mirror mirror! 60*scalingFactor width
                tint(200, 50, 100, 20)
                let mirrorLocation = [
                    cos(radians(blueMirrorAngle))*mirrorRadius + centerOfBoard[0],
                    sin(radians(blueMirrorAngle))*mirrorRadius + centerOfBoard[1]]
                image(mirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)

                let shivaRadius = mainBodyWidth/4
                displayShiva([cos(radians(blueMirrorAngle - 180))*shivaRadius,
                    sin(radians(blueMirrorAngle - 180))*shivaRadius], "boss", "Reap!", 15*scalingFactor)

                // only finish with this stage once everyone has
                // gotten into their positions
                if (((abs(realMT.x - MT[0]) < scalingFactor/2) && (abs(realMT.y - MT[1]) < scalingFactor/2)) &&
                    ((abs(realOT.x - OT[0]) < scalingFactor/2) && (abs(realOT.y - OT[1]) < scalingFactor/2)) &&
                    ((abs(realH1.x - H1[0]) < scalingFactor/2) && (abs(realH1.y - H1[1]) < scalingFactor/2)) &&
                    ((abs(realH2.x - H2[0]) < scalingFactor/2) && (abs(realH2.y - H2[1]) < scalingFactor/2)) &&
                    ((abs(realM1.x - M1[0]) < scalingFactor/2) && (abs(realM1.y - M1[1]) < scalingFactor/2)) &&
                    ((abs(realM2.x - M2[0]) < scalingFactor/2) && (abs(realM2.y - M2[1]) < scalingFactor/2)) &&
                    ((abs(realR1.x - R1[0]) < scalingFactor/2) && (abs(realR1.y - R1[1]) < scalingFactor/2)) &&
                    ((abs(realR2.x - R2[0]) < scalingFactor/2) && (abs(realR2.y - R2[1]) < scalingFactor/2))) {
                    stage = 2


                    let baseX = cos(radians(blueMirrorAngle - 180))*shivaRadius
                    let baseY = sin(radians(blueMirrorAngle - 180))*shivaRadius

                    // donut
                    fill(200, 70, 100, 100)
                    stroke(0, 0, 100, 100)
                    strokeWeight(3)
                    beginShape()
                    for (let i = 0; i < TWO_PI; i += TWO_PI/10000) {
                        let x = cos(i)*mainBodyWidth/2 + baseX + centerOfBoard[0]
                        let y = sin(i)*mainBodyWidth/2 + baseY + centerOfBoard[1]
                        vertex(x, y)
                    }
                    beginContour()
                    for (let i = TWO_PI; i > 0; i -= TWO_PI/10000) {
                        let x = cos(i)*mainBodyWidth/10 + baseX + centerOfBoard[0]
                        let y = sin(i)*mainBodyWidth/10 + baseY + centerOfBoard[1]
                        vertex(x, y)
                    }
                    endContour()
                    endShape(CLOSE)


                    // display proteans
                    fill(60, 100, 100, 60)
                    stroke(0, 0, 100, 100)
                    strokeWeight(5)
                    for (let player of [MT, OT, M1, M2]) {
                        let angle = atan2(player[1] - baseY, player[0] - baseX)

                        arc(centerOfBoard[0] + baseX, centerOfBoard[1] + baseY,
                            1500*scalingFactor, 1500*scalingFactor, angle - PI/8, angle + PI/8, PIE)
                    }

                    baseX = cos(radians(blueMirrorAngle))*mirrorRadius
                    baseY = sin(radians(blueMirrorAngle))*mirrorRadius

                    // donut
                    fill(200, 70, 100, 100)
                    stroke(0, 0, 100, 100)
                    strokeWeight(3)
                    beginShape()
                    for (let i = 0; i < TWO_PI; i += TWO_PI/10000) {
                        let x = cos(i)*mainBodyWidth/2 + baseX + centerOfBoard[0]
                        let y = sin(i)*mainBodyWidth/2 + baseY + centerOfBoard[1]
                        vertex(x, y)
                    }
                    beginContour()
                    for (let i = TWO_PI; i > 0; i -= TWO_PI/10000) {
                        let x = cos(i)*mainBodyWidth/10 + baseX + centerOfBoard[0]
                        let y = sin(i)*mainBodyWidth/10 + baseY + centerOfBoard[1]
                        vertex(x, y)
                    }
                    endContour()
                    endShape(CLOSE)

                    // display proteans
                    fill(60, 100, 100, 60)
                    stroke(0, 0, 100, 100)
                    strokeWeight(5)
                    for (let player of [H1, H2, R1, R2]) {
                        let angle = atan2(player[1] - baseY, player[0] - baseX)

                        arc(centerOfBoard[0] + baseX, centerOfBoard[1] + baseY,
                            1500*scalingFactor, 1500*scalingFactor, angle - PI/8, angle + PI/8, PIE)
                    }

                    // reference code, inherited from Diamond Dust. it
                    // displays proteans on cardinals or intercardinals
                    // strokeWeight(5*scalingFactor)
                    // if (AoEsSpawnedOn === "cardinal") {
                    //     arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                    //         1000*scalingFactor, 1000*scalingFactor, -PI/8, PI/8, PIE)
                    //     arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                    //         1000*scalingFactor, 1000*scalingFactor, 3*PI/8, 5*PI/8, PIE)
                    //     arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                    //         1000*scalingFactor, 1000*scalingFactor, 7*PI/8, 9*PI/8, PIE)
                    //     arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                    //         1000*scalingFactor, 1000*scalingFactor, 11*PI/8, 13*PI/8, PIE)
                    // } if (AoEsSpawnedOn === "intercardinal") {
                    //     arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                    //         1000*scalingFactor, 1000*scalingFactor, PI/8, 3*PI/8, PIE)
                    //     arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                    //         1000*scalingFactor, 1000*scalingFactor, 5*PI/8, 7*PI/8, PIE)
                    //     arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                    //         1000*scalingFactor, 1000*scalingFactor, 9*PI/8, 11*PI/8, PIE)
                    //     arc(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2,
                    //         1000*scalingFactor, 1000*scalingFactor, 13*PI/8, 15*PI/8, PIE)
                    // }

                    frameRate(1)

                    stage = 1.75
                    return
                }
            } if (stage === 1.75) {
                erase()
                rect(0, 0, width, height)
                noErase()
                stage = 2
            } if (stage === 2) {
                // draw a mirror mirror! 60*scalingFactor width
                tint(200, 50, 100, 20)
                let mirrorLocation = [
                    cos(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)

                // where to click? red mirror 1 is always counterclockwise
                // of red mirror 2.
                // for reference:
                // 1. red mirrors spawn around blue mirror                           \\
                // 2. red mirrors spawn 45º and 135º counterclockwise of blue mirror \\
                // 3. red mirrors spawn 90º and 180º counterclockwise of blue mirror \\
                // 4. red mirrors spawn opposite blue mirror                         \\
                // 5. red mirrors spawn 90º and 180º clockwise of blue mirror        \\
                // 6. red mirrors spawn 45º and 135º clockwise of blue mirror        \\
                // now for the real thing
                // ranged:
                // 1. we want to rotate clockwise. red mirror 2 is more clockwise, and it's still around us
                // 2. the nearest one is 45º counterclockwise of us. it's less counterclockwise than the 135 one, so that's red mirror 2
                // 3. the nearest one is 90º counterclockwise of us. That's also red mirror 2
                // 4. we want to rotate clockwise. red mirror 2 is more clockwise, but it's technically more than 180º clockwise. we want red mirror 1.
                // 5. the nearest one is 90º clockwise of us. That's more counterclockwise, so it's red mirror 1.
                // 6. the nearest one is 45º clockwise of us. That's more counterclockwise, so it's red mirror 1.
                // summary: if state > 3, ranged pick red mirror 1 and melee pick red mirror 2.
                // if state <= 3, ranged pick red mirror 2 and melee pick
                // red mirror 2.
                // note: the variable is redMirrorConfig

                // alright. enough commenting. more code.
                let greenDotRadius = 3*mainBodyWidth/8
                let dotOne = [
                    cos(radians(redMirrorAngleOne))*greenDotRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleOne))*greenDotRadius + centerOfBoard[1]]
                let dotTwo = [
                    cos(radians(redMirrorAngleTwo))*greenDotRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleTwo))*greenDotRadius + centerOfBoard[1]]
                displayGreenDot(cos(radians(redMirrorAngleOne))*greenDotRadius,
                    sin(radians(redMirrorAngleOne))*greenDotRadius)
                displayGreenDot(cos(radians(redMirrorAngleTwo))*greenDotRadius,
                    sin(radians(redMirrorAngleTwo))*greenDotRadius)

                if (mousePressedButNotHeldDown()) {
                    if (inClickingRange(dotOne, 15 * scalingFactor)) {
                        if ((meleeOrRanged(role) === "melee") !== (redMirrorConfig < 4)) {
                            stage = 100
                            updateLosses(3)
                        } else stage = 2.25
                        if (redMirrorConfig < 4) {
                            // in this situation, ranged pick red mirror
                            // 2 and melee pick red mirror 1.
                            if (meleeOrRanged(role) === "melee") {
                                if (redMirrorConfig === 1 || redMirrorConfig === 4) {
                                    textAtBottom = "You went to the mirror" +
                                        " clockwise of you. \n[PASS] — Red" +
                                        " mirrors spawned towards you." +
                                        " \n[PASS] — You went to the one" +
                                        " clockwise of you."
                                    textAtTop = "Select where you want to" +
                                        " bait your red mirror."
                                } else {
                                    textAtBottom = "You went to the mirror" +
                                        " closer to you. \n[PASS] — You are" +
                                        " supposed to go to the mirror" +
                                        " closer to you."
                                    textAtTop = "Select where you want to" +
                                        " bait your red mirror."
                                }
                            } else {
                                if (redMirrorConfig === 1 || redMirrorConfig === 4) {
                                    textAtBottom = "You went to the mirror" +
                                        " counterclockwise of you. \n[PASS] —" +
                                        " Red mirrors spawned towards you." +
                                        " \n[FAIL] — You went to the one" +
                                        " counterclockwise, not clockwise," +
                                        " of you."
                                    textAtTop = "If mirrors spawn near" +
                                        " you, you want to rotate clockwise," +
                                        " not counterclockwise."
                                } else {
                                    textAtBottom = "You went to the mirror" +
                                        " farther from you. \n[FAIL] — You" +
                                        " are supposed to go to the mirror" +
                                        " closer to you."
                                    textAtTop = "If applicable, you will" +
                                        " always want to go to the red" +
                                        " mirror closer to you."
                                }
                            }
                        } else {
                            // in this situation, ranged pick red mirror
                            // 1 and melee pick red mirror 2.
                            if (meleeOrRanged(role) === "melee") {
                                if (redMirrorConfig === 1 || redMirrorConfig === 4) {
                                    textAtBottom = "You went to the mirror" +
                                        " counterclockwise of you. \n[PASS] —" +
                                        " Red mirrors spawned towards you." +
                                        " \n[FAIL] — You went to the one" +
                                        " counterclockwise, not clockwise," +
                                        " of you."
                                    textAtTop = "If mirrors spawn near" +
                                        " you, you want to rotate clockwise," +
                                        " not counterclockwise."
                                } else {
                                    textAtBottom = "You went to the mirror" +
                                        " farther from you. \n[FAIL] — You" +
                                        " are supposed to go to the mirror" +
                                        " closer to you."
                                    textAtTop = "If applicable, you will" +
                                        " always want to go to the red" +
                                        " mirror closer to you."
                                }
                            } else {
                                if (redMirrorConfig === 1 || redMirrorConfig === 4) {
                                    textAtBottom = "You went to the mirror" +
                                        " clockwise of you. \n[PASS] — Red" +
                                        " mirrors spawned towards you." +
                                        " \n[PASS] — You went to the one" +
                                        " clockwise of you."
                                    textAtTop = "Select where you want to" +
                                        " bait your red mirror."
                                } else {
                                    textAtBottom = "You went to the mirror" +
                                        " closer to you. \n[PASS] — You are" +
                                        " supposed to go to the mirror" +
                                        " closer to you."
                                    textAtTop = "Select where you want to" +
                                        " bait your red mirror."
                                }
                            }
                        }
                    }
                    if (inClickingRange(dotTwo, 15 * scalingFactor)) {
                        if ((meleeOrRanged(role) === "melee") === (redMirrorConfig < 4)) {
                            stage = 100
                            updateLosses(3)
                        } else stage = 2.25
                        if (redMirrorConfig < 4) {
                            // in this situation, ranged pick red mirror
                            // 2 and melee pick red mirror 1.
                            if (meleeOrRanged(role) === "melee") {
                                if (redMirrorConfig === 1 || redMirrorConfig === 4) {
                                    textAtBottom = "You went to the mirror" +
                                        " counterclockwise of you. \n[PASS] —" +
                                        " Red mirrors spawned towards you." +
                                        " \n[FAIL] — You went to the one" +
                                        " counterclockwise, not clockwise," +
                                        " of you."
                                    textAtTop = "If mirrors spawn near" +
                                        " you, you want to rotate clockwise," +
                                        " not counterclockwise."
                                } else {
                                    textAtBottom = "You went to the mirror" +
                                        " farther from you. \n[FAIL] — You" +
                                        " are supposed to go to the mirror" +
                                        " closer to you."
                                    textAtTop = "If applicable, you will" +
                                        " always want to go to the red" +
                                        " mirror closer to you."
                                }
                            } else {
                                if (redMirrorConfig === 1 || redMirrorConfig === 4) {
                                    textAtBottom = "You went to the mirror" +
                                        " clockwise of you. \n[PASS] — Red" +
                                        " mirrors spawned towards you." +
                                        " \n[PASS] — You went to the one" +
                                        " clockwise of you."
                                    textAtTop = "Select where you want to" +
                                        " bait your red mirror."
                                } else {
                                    textAtBottom = "You went to the mirror" +
                                        " closer to you. \n[PASS] — You are" +
                                        " supposed to go to the mirror" +
                                        " closer to you."
                                    textAtTop = "Select where you want to" +
                                        " bait your red mirror."
                                }
                            }
                        } else {
                            // in this situation, ranged pick red mirror
                            // 1 and melee pick red mirror 2.
                            if (meleeOrRanged(role) === "melee") {
                                if (redMirrorConfig === 1 || redMirrorConfig === 4) {
                                    textAtBottom = "You went to the mirror" +
                                        " clockwise of you. \n[PASS] — Red" +
                                        " mirrors spawned towards you." +
                                        " \n[PASS] — You went to the one" +
                                        " clockwise of you."
                                    textAtTop = "Select where you want to" +
                                        " bait your red mirror."
                                } else {
                                    textAtBottom = "You went to the mirror" +
                                        " closer to you. \n[PASS] — You are" +
                                        " supposed to go to the mirror" +
                                        " closer to you."
                                    textAtTop = "Select where you want to" +
                                        " bait your red mirror."
                                }
                            } else {
                                if (redMirrorConfig === 1 || redMirrorConfig === 4) {
                                    textAtBottom = "You went to the mirror" +
                                        " counterclockwise of you. \n[PASS] —" +
                                        " Red mirrors spawned towards you." +
                                        " \n[FAIL] — You went to the one" +
                                        " counterclockwise, not clockwise," +
                                        " of you."
                                    textAtTop = "If mirrors spawn near" +
                                        " you, you want to rotate clockwise," +
                                        " not counterclockwise."
                                } else {
                                    textAtBottom = "You went to the mirror" +
                                        " farther from you. \n[FAIL] — You" +
                                        " are supposed to go to the mirror" +
                                        " closer to you."
                                    textAtTop = "If applicable, you will" +
                                        " always want to go to the red" +
                                        " mirror closer to you."
                                }
                            }
                        }
                    }
                }
            } if (stage === 2.25) {
                // draw a mirror mirror! 60*scalingFactor width
                tint(200, 50, 100, 20)
                let mirrorLocation = [
                    cos(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)

                // reminder of long block of comments?
                // where to click? red mirror 1 is always counterclockwise
                // of red mirror 2.
                // for reference:
                // 1. red mirrors spawn around blue mirror                           \\
                // 2. red mirrors spawn 45º and 135º counterclockwise of blue mirror \\
                // 3. red mirrors spawn 90º and 180º counterclockwise of blue mirror \\
                // 4. red mirrors spawn opposite blue mirror                         \\
                // 5. red mirrors spawn 90º and 180º clockwise of blue mirror        \\
                // 6. red mirrors spawn 45º and 135º clockwise of blue mirror        \\
                // now for the real thing
                // ranged:
                // 1. we want to rotate clockwise. red mirror 2 is more clockwise, and it's still around us
                // 2. the nearest one is 45º counterclockwise of us. it's less counterclockwise than the 135 one, so that's red mirror 2
                // 3. the nearest one is 90º counterclockwise of us. That's also red mirror 2
                // 4. we want to rotate clockwise. red mirror 2 is more clockwise, but it's technically more than 180º clockwise. we want red mirror 1.
                // 5. the nearest one is 90º clockwise of us. That's more counterclockwise, so it's red mirror 1.
                // 6. the nearest one is 45º clockwise of us. That's more counterclockwise, so it's red mirror 1.
                // summary: if state > 3, ranged pick red mirror 1 and melee pick red mirror 2.
                // if state <= 3, ranged pick red mirror 2 and melee pick
                // red mirror 2.
                // note: the variable is redMirrorConfig
                let rangedRedMirror = redMirrorConfig > 3 ? redMirrorAngleOne : redMirrorAngleTwo
                let meleeRedMirror = redMirrorConfig < 4 ? redMirrorAngleOne : redMirrorAngleTwo
                let playerRadius = 3*mainBodyWidth/8
                MT = [cos(radians(meleeRedMirror + random(-10, 10)))*playerRadius, sin(radians(meleeRedMirror + random(-10, 10)))*playerRadius]
                OT = [cos(radians(meleeRedMirror + random(-10, 10)))*playerRadius, sin(radians(meleeRedMirror + random(-10, 10)))*playerRadius]
                M1 = [cos(radians(meleeRedMirror + random(-10, 10)))*playerRadius, sin(radians(meleeRedMirror + random(-10, 10)))*playerRadius]
                M2 = [cos(radians(meleeRedMirror + random(-10, 10)))*playerRadius, sin(radians(meleeRedMirror + random(-10, 10)))*playerRadius]
                H1 = [cos(radians(rangedRedMirror + random(-10, 10)))*playerRadius, sin(radians(rangedRedMirror + random(-10, 10)))*playerRadius]
                H2 = [cos(radians(rangedRedMirror + random(-10, 10)))*playerRadius, sin(radians(rangedRedMirror + random(-10, 10)))*playerRadius]
                R1 = [cos(radians(rangedRedMirror + random(-10, 10)))*playerRadius, sin(radians(rangedRedMirror + random(-10, 10)))*playerRadius]
                R2 = [cos(radians(rangedRedMirror + random(-10, 10)))*playerRadius, sin(radians(rangedRedMirror + random(-10, 10)))*playerRadius]
                stage = 3
            } if (stage === 3) {
                // draw a mirror mirror! 60*scalingFactor width
                tint(200, 50, 100, 20)
                let mirrorLocation = [
                    cos(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleOne))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)
                mirrorLocation = [
                    cos(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[0],
                    sin(radians(redMirrorAngleTwo))*mirrorRadius + centerOfBoard[1]]
                image(redMirror, mirrorLocation[0] - mirrorSize/2, mirrorLocation[1] - mirrorSize/2, mirrorSize, mirrorSize)

                // alright. time for the ultimate time-consumer: the red
                // mirror green dot positions!
                let redMirrorAngleYouAreOn
                if (meleeOrRanged(role) === "melee") {
                    redMirrorAngleYouAreOn = redMirrorConfig < 4 ? redMirrorAngleOne : redMirrorAngleTwo
                } else {
                    redMirrorAngleYouAreOn = redMirrorConfig > 3 ? redMirrorAngleOne : redMirrorAngleTwo
                }
            }
        }
    }
    // M6S start & adds background
    if (currentlySelectedBackground === "M6S Start & Adds") {
        angleMode(DEGREES)
        tint(0, 0, 100, 5)
        // the death wall is already included, so there is no reason to pad
        // the top, left, bottom, and right to add an extra death wall
        image(m6sP1Image, -mainBodyWidth/2, -mainBodyWidth/2,
            mainBodyWidth, mainBodyWidth)
        displayCharacterPositions()

        // now then, for the waymarks
        let circleWaymarkRadius = mainBodyWidth*6/24
        let rectWaymarkRadius = mainBodyWidth*6/24*sqrt(2)
        let waymarkAlpha = 20
        glowWaymark(0, 100, 80, waymarkAlpha, "circle", 7*scalingFactor, cos(-90)*circleWaymarkRadius, sin(-90)*circleWaymarkRadius, 30*scalingFactor, "A")
        glowWaymark(0, 100, 80, waymarkAlpha, "rect", 7*scalingFactor, cos(-135)*rectWaymarkRadius, sin(-135)*rectWaymarkRadius, 30*scalingFactor, "1")
        glowWaymark(270, 100, 80, waymarkAlpha, "circle", 7*scalingFactor, cos(180)*circleWaymarkRadius, sin(180)*circleWaymarkRadius, 30*scalingFactor, "D")
        glowWaymark(270, 100, 80, waymarkAlpha, "rect", 7*scalingFactor, cos(135)*rectWaymarkRadius, sin(135)*rectWaymarkRadius, 30*scalingFactor, "4")
        glowWaymark(180, 100, 80, waymarkAlpha, "circle", 7*scalingFactor, cos(90)*circleWaymarkRadius, sin(90)*circleWaymarkRadius, 30*scalingFactor, "C")
        glowWaymark(180, 100, 80, waymarkAlpha, "rect", 7*scalingFactor, cos(45)*rectWaymarkRadius, sin(45)*rectWaymarkRadius, 30*scalingFactor, "3")
        glowWaymark(60, 100, 80, waymarkAlpha, "circle", 7*scalingFactor, cos(0)*circleWaymarkRadius, sin(0)*circleWaymarkRadius, 30*scalingFactor, "B")
        glowWaymark(60, 100, 80, waymarkAlpha, "rect", 7*scalingFactor, cos(-45)*rectWaymarkRadius, sin(-45)*rectWaymarkRadius, 30*scalingFactor, "2")

        pop()

        fill(0, 100, 100)
        noStroke()
        push()
        textSize(50)
        textAlign(CENTER, CENTER)
        translateToCenterOfBoard()
        scale(1, 2)
        rotate(-10)
        text('This mechanic was abandoned', 0, 0)
        pop()


        angleMode(RADIANS)
    }
    // M8S P1 background
    if (currentlySelectedBackground === "M8S P1") {
        angleMode(DEGREES)
        tint(0, 0, 100, 5)
        // the death wall is already included, so there is no reason to pad
        // the top, left, bottom, and right to add an extra death wall
        image(m8sP1Image, -mainBodyWidth/2, -mainBodyWidth/2,
            mainBodyWidth, mainBodyWidth)
        displayCharacterPositions()

        // now then, for the waymarks
        let waymarkRadius = mainBodyWidth*6/13
        glowWaymark(0, 100, 80, "circle", 7*scalingFactor, cos(-90)*waymarkRadius, sin(-90)*waymarkRadius, 30*scalingFactor, "A")
        glowWaymark(0, 100, 80, "rect", 7*scalingFactor, cos(-135)*waymarkRadius, sin(-135)*waymarkRadius, 30*scalingFactor, "1")
        glowWaymark(270, 100, 80, "circle", 7*scalingFactor, cos(180)*waymarkRadius, sin(180)*waymarkRadius, 30*scalingFactor, "D")
        glowWaymark(270, 100, 80, "rect", 7*scalingFactor, cos(135)*waymarkRadius, sin(135)*waymarkRadius, 30*scalingFactor, "4")
        glowWaymark(180, 100, 80, "circle", 7*scalingFactor, cos(90)*waymarkRadius, sin(90)*waymarkRadius, 30*scalingFactor, "C")
        glowWaymark(180, 100, 80, "rect", 7*scalingFactor, cos(45)*waymarkRadius, sin(45)*waymarkRadius, 30*scalingFactor, "3")
        glowWaymark(60, 100, 80, "circle", 7*scalingFactor, cos(0)*waymarkRadius, sin(0)*waymarkRadius, 30*scalingFactor, "B")
        glowWaymark(60, 100, 80, "rect", 7*scalingFactor, cos(-45)*waymarkRadius, sin(-45)*waymarkRadius, 30*scalingFactor, "2")

        pop()


        if (currentlySelectedMechanic === "Millennial Decay") {
            if (stage === 0) {
                displayGreenDot(0, 0)
                if (inClickingRange(centerOfBoard, 10*scalingFactor) && mousePressedButNotHeldDown()) {
                    stage = 0.5

                    // separated by pair, listing ranged first in each pair
                    // northwest
                    H1 = [random(-70*scalingFactor, -40*scalingFactor), random(-70*scalingFactor, -40*scalingFactor)]
                    M1 = [random(-40*scalingFactor, -20*scalingFactor), random(-40*scalingFactor, -20*scalingFactor)]

                    // southwest
                    H2 = [random(-70*scalingFactor, -40*scalingFactor), random(70*scalingFactor, 40*scalingFactor)]
                    M2 = [random(-40*scalingFactor, -20*scalingFactor), random(40*scalingFactor, 20*scalingFactor)]

                    // southeast
                    R2 = [random(70*scalingFactor, 40*scalingFactor), random(70*scalingFactor, 40*scalingFactor)]
                    OT = [random(40*scalingFactor, 20*scalingFactor), random(40*scalingFactor, 20*scalingFactor)]

                    // northeast
                    R1 = [random(70*scalingFactor, 40*scalingFactor), random(-70*scalingFactor, -40*scalingFactor)]
                    MT = [random(40*scalingFactor, 20*scalingFactor), random(-40*scalingFactor, -20*scalingFactor)]

                    return
                }
            } if (stage === 0.5) {
                if (belowPositioningThreshold(130*scalingFactor, [
                    [MT, realMT],
                    [OT, realOT],
                    [H1, realH1],
                    [H2, realH2],
                    [M1, realM1],
                    [M2, realM2],
                    [R1, realR1],
                    [R2, realR2]
                ])) {
                    stage = 0.66
                    textAtBottom = "[PASS] — You can actually click."
                }
            } if (stage === 0.66) {
                // display a wolf head
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                push()
                translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                rotate(angle + 90) // facing mid
                image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                pop()
                pop()
                if (belowPositioningThreshold(45*scalingFactor, [
                    [MT, realMT],
                    [OT, realOT],
                    [H1, realH1],
                    [H2, realH2],
                    [M1, realM1],
                    [M2, realM2],
                    [R1, realR1],
                    [R2, realR2]
                ])) {
                    stage = 0.83
                }
            } if (stage === 0.83) {
                // display 2 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                push()
                translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                rotate(angle + 90) // facing mid
                image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                pop()
                for (let i = 1; i < 2; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()
                if (belowPositioningThreshold(0.5*scalingFactor, [
                    [MT, realMT],
                    [OT, realOT],
                    [H1, realH1],
                    [H2, realH2],
                    [M1, realM1],
                    [M2, realM2],
                    [R1, realR1],
                    [R2, realR2]
                ])) {
                    stage = 1
                    textAtTop = "Get knocked back to the correct spot. This" +
                        " quiz assumes you are using knockback immune, but" +
                        " if you are \nlike me, you might not be using" +
                        " knockback immune. Healers should definitely" +
                        " consider not using KI as \nthey want to be in the" +
                        " center anyways to heal." +
                        " \nThis time, " + dpsOrSupportsFirst + " have been targeted."
                }
            } if (stage === 1) {
                // display 3 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                push()
                translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                rotate(angle + 90) // facing mid
                image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                pop()
                for (let i = 1; i < 3; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()

                let AoEsize = 140*scalingFactor // very important to get spread AoE size correct
                angleMode(RADIANS)
                // mark whoever got targeted first
                if (dpsOrSupportsFirst === "supports") {
                    displayTargetSymbol(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1])
                    displayTargetSymbol(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1])
                    displayTargetSymbol(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1])
                    displayTargetSymbol(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1])
                    displaySpreadMarker(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                } if (dpsOrSupportsFirst === "DPS") {
                    displayTargetSymbol(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1])
                    displayTargetSymbol(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1])
                    displayTargetSymbol(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1])
                    displayTargetSymbol(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1])
                    displaySpreadMarker(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                }
                angleMode(DEGREES)

                // for the rest of this mech, there will be 3 radii of dots
                // with 30-angle and 45-angle increments
                // the inner one is for melees
                // the outer one is for ranged
                // the medium one is so that you can actually get to the
                // outer ring to the inner ring

                let innerRadius = mainBodyWidth/6
                let outerRadius = 5*mainBodyWidth/13

                let innerDots = []
                let outerDots = []

                for (let angle = 0; angle < 360; angle += 15) {
                    if (angle % 45 === 0 || angle % 30 === 0) {
                        displaySmallGreenDot(cos(angle) * innerRadius, sin(angle) * innerRadius)
                        displayGreenDot(cos(angle) * outerRadius, sin(angle) * outerRadius)

                        innerDots.push([cos(angle) * innerRadius + centerOfBoard[0], sin(angle) * innerRadius + centerOfBoard[1]])
                        outerDots.push([cos(angle) * outerRadius + centerOfBoard[0], sin(angle) * outerRadius + centerOfBoard[1]])
                    }
                }

                if (mousePressedButNotHeldDown()) {
                    if (inClickingRanges(innerDots, 7 * scalingFactor)) {
                        if (meleeOrRanged(role) === "ranged") {
                            stage = 100
                            textAtTop = "You're a ranged. Ranged always go out."
                            textAtBottom = "You went to one of the inner dots." +
                                " \n[FAIL] — This quiz fails you if you are not" +
                                " planning to use KI."
                            updateLosses(1)
                            return
                        } else {
                            // you're a melee
                            // if you are not marked, then you will want to go
                            // within a few degrees of the west/east dots
                            // if you are marked, you need to go to one of
                            // the intercardinals
                            let clickedDot = inClickingRanges(innerDots, 7*scalingFactor) // always returns the position of the dot

                            // for all practical purposes, we will want to
                            // make 0,0 the center of the board. right now,
                            // 0,0 is the top-left of the screen
                            clickedDot = [clickedDot[0] - centerOfBoard[0],
                                          clickedDot[1] - centerOfBoard[1]]

                            // but first we need to find the angle. right
                            // now we are in degrees
                            let angle = round(atan2(clickedDot[1], clickedDot[0]))

                            // first, rule out parts getting hit by the
                            // line AoE (-120, -90, -60, 60, 90, 120)
                            if (checkEqualities(angle, [-120, -90, -60, 60, 90, 120])) {
                                stage = 100
                                textAtTop = "Oops, this spot is clipped by the line AoE."
                                textAtBottom = "You went to a more N/S" +
                                    " location. \n[PASS] — You are a melee," +
                                    " and you went to one of the inner dots." +
                                    " \n[FAIL] — This location is clipped by" +
                                    " the line AoE."
                                updateLosses(1)
                                return
                            }


                            textAtBottom = "\n[PASS] — You are a melee, and you went to one of the inner dots. " +
                                "\n[PASS] — You dodged the line AoE."
                            if (DPSOrSupports(role) === dpsOrSupportsFirst) {
                                // this is if you are marked
                                // only the intercardinal dots are good:
                                //   45, 135, -135, -45
                                // M1 takes -135
                                // M2 takes 135
                                // MT takes -45
                                // OT takes 45

                                // the way we're going to do this is to check what the angle is, and what your role is separately
                                if (angle === -135) {
                                    textAtBottom = "You went to M1's spot." + textAtBottom
                                    if (role === "M1") stage = 1.25
                                    else stage = 100
                                } else if (angle === 135) {
                                    textAtBottom = "You went to M2's spot." + textAtBottom
                                    if (role === "M2") stage = 1.25
                                    else stage = 100
                                } else if (angle === -45) {
                                    textAtBottom = "You went to MT's spot." + textAtBottom
                                    if (role === "MT") stage = 1.25
                                    else stage = 100
                                } else if (angle === 45) {
                                    textAtBottom = "You went to OT's spot." + textAtBottom
                                    if (role === "OT") stage = 1.25
                                    else stage = 100
                                }

                                if (stage === 1.25) { // you went to your spot
                                    textAtBottom += "\n[PASS] — You are " + textAtBottom[12] + textAtBottom[13] + "."
                                    textAtTop = "Please wait for people to get in their spot."
                                } if (stage === 100) { // you didn't go to your spot
                                    textAtBottom += "\n[FAIL] — You are not " + textAtBottom[12] + textAtBottom[13] + "."
                                    textAtTop = "You went to the completely wrong spread spot."
                                    updateLosses(1)
                                } if (stage === 1) { // you didn't go to a cardinal so none of the checks went through
                                    textAtBottom = "You went to a non-spread location." + textAtBottom +
                                        "\n[FAIL] — You are probably going to clip the other melee."
                                    stage = 100
                                    textAtTop = "The positioning is tight if you go there. Try to avoid doing that."
                                    updateLosses(1)
                                }
                            } else {
                                // this is if you are not marked
                                // acceptable positions: 0º, 30º, 150º, 180º,
                                // -150º, -30º
                                // check which side you're on

                                // we will do the same thing as when you are
                                // marked
                                if (checkEqualities(angle, [-30, 0, 30])) {
                                    textAtBottom = "You went to the tank's spot." + textAtBottom
                                    if (role === "MT" || role === "OT") stage = 1.25
                                    else stage = 100
                                } if (checkEqualities(angle, [150, 180, -150])) {
                                    textAtBottom = "You went to the melee's spot." + textAtBottom
                                    if (role === "M1" || role === "M2") stage = 1.25
                                    else stage = 100
                                }
                                if (stage === 1.25) { // you went to your spot
                                    textAtBottom += "\n[PASS] — You are hiding in the correct spot."
                                    textAtTop = "Please wait for people to get in their spot."
                                } if (stage === 100) { // you didn't go to your spot
                                    textAtBottom += "\n[FAIL] — You are on the wrong side."
                                    textAtTop = "You went to the completely wrong side."
                                    updateLosses(1)
                                } if (stage === 1) { // you didn't go to a cardinal so none of the checks went through
                                    textAtBottom = "You went to a non-spread location." + textAtBottom +
                                        "\n[FAIL] — You are probably going to clip the other melee."
                                    stage = 100
                                    textAtTop = "The positioning is tight if you go there. Try to avoid doing that."
                                    updateLosses(1)
                                }
                            }
                            return
                        }
                    }
                    if (inClickingRanges(outerDots, 15 * scalingFactor)) {
                        if (meleeOrRanged(role) === "melee") {
                            stage = 100
                            textAtTop = "You're a melee. Melee always go in."
                            textAtBottom = "You went to one of the inner dots." +
                                " \n[FAIL] — Melees go in."
                            updateLosses(1)
                            return
                        } else {
                            // you're a ranged
                            // if you are not marked, then you will want to go
                            // within a few degrees of the west/east dots
                            // if you are marked, you need to go to one of
                            // the intercardinals
                            let clickedDot = inClickingRanges(outerDots, 15*scalingFactor) // always returns the position of the dot

                            // for all practical purposes, we will want to
                            // make 0,0 the center of the board. right now,
                            // 0,0 is the top-left of the screen
                            clickedDot = [clickedDot[0] - centerOfBoard[0],
                                clickedDot[1] - centerOfBoard[1]]

                            // but first we need to find the angle. right
                            // now we are in degrees
                            let angle = round(atan2(clickedDot[1], clickedDot[0]))

                            // first, rule out parts getting hit by the
                            // line AoE (-90, 90)
                            if (checkEqualities(angle, [-90, 90])) {
                                stage = 100
                                textAtTop = "Oops, this spot is clipped by the line AoE."
                                textAtBottom = "You went to a more N/S" +
                                    " location. \n[PASS] — You are a ranged," +
                                    " and you went to one of the outer dots." +
                                    " \n[FAIL] — This location is clipped by" +
                                    " the line AoE."
                                updateLosses(1)
                                return
                            }


                            textAtBottom = "\n[PASS] — You are a ranged, and you" +
                                " went to one of the outer dots. " +
                                "\n[PASS] — You dodged the line AoE."
                            if (DPSOrSupports(role) === dpsOrSupportsFirst) {
                                // this is if you are marked
                                // only the intercardinal dots are good:
                                //   45, 135, -135, -45
                                // R1 takes -135
                                // R2 takes 135
                                // H1 takes -45
                                // H2 takes 45
                                // going to the 60, -60, 120, and -120 dots
                                // is also good.

                                // the way we're going to do this is to check what the angle is, and what your role is separately
                                if (angle === -45 || angle === -60) {
                                    textAtBottom = "You went to R1's spot." + textAtBottom
                                    if (role === "R1") stage = 1.25
                                    else stage = 100
                                } else if (angle === 45 || angle === 60) {
                                    textAtBottom = "You went to R2's spot." + textAtBottom
                                    if (role === "R2") stage = 1.25
                                    else stage = 100
                                } else if (angle === -135 || angle === -120) {
                                    textAtBottom = "You went to H1's spot." + textAtBottom
                                    if (role === "H1") stage = 1.25
                                    else stage = 100
                                } else if (angle === 135 || angle === 120) {
                                    textAtBottom = "You went to H2's spot." + textAtBottom
                                    if (role === "H2") stage = 1.25
                                    else stage = 100
                                }

                                if (stage === 1.25) { // you went to your spot
                                    textAtBottom += "\n[PASS] — You are " + textAtBottom[12] + textAtBottom[13] + "."
                                    textAtTop = "Please wait for people to get in their spot."
                                } if (stage === 100) { // you didn't go to your spot
                                    textAtBottom += "\n[FAIL] — You are not " + textAtBottom[12] + textAtBottom[13] + "."
                                    textAtTop = "You went to the completely wrong spread spot."
                                    updateLosses(1)
                                } if (stage === 1) { // you didn't go to a cardinal so none of the checks went through
                                    textAtBottom = "You went to a non-spread location." + textAtBottom +
                                        "\n[FAIL] — Positioning is tight here."
                                    stage = 100
                                    textAtTop = "The positioning is tight if you go there. Try to avoid doing that."
                                    updateLosses(1)
                                }
                            } else {
                                // this is if you are not marked
                                // acceptable positions: 0º, 30º, 150º, 180º,
                                // -150º, -30º
                                // check which side you're on

                                // we will do the same thing as when you are
                                // marked
                                if (checkEqualities(angle, [150, 180, -150])) {
                                    textAtBottom = "You went to the healer's spot." + textAtBottom
                                    if (role === "H1" || role === "H2") stage = 1.25
                                    else stage = 100
                                } if (checkEqualities(angle, [-30, 0, 30])) {
                                    textAtBottom = "You went to the ranged spot." + textAtBottom
                                    if (role === "R1" || role === "R2") stage = 1.25
                                    else stage = 100
                                }
                                if (stage === 1.25) { // you went to your spot
                                    textAtBottom += "\n[PASS] — You are hiding in the correct spot."
                                    textAtTop = "Please wait for people to get in their spot."
                                } if (stage === 100) { // you didn't go to your spot
                                    textAtBottom += "\n[FAIL] — You are on the wrong side."
                                    textAtTop = "You went to the completely wrong side."
                                    updateLosses(1)
                                } if (stage === 1) { // you didn't go to a cardinal so none of the checks went through
                                    textAtBottom = "You went to a spread location." + textAtBottom +
                                        "\n[FAIL] — Positioning is tight here."
                                    stage = 100
                                    textAtTop = "The positioning is tight if you go there. Try to avoid doing that."
                                    updateLosses(1)
                                }
                            }
                            return
                        }
                    }
                }
            } if (stage === 1.25) {
                // display 3 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                push()
                translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                rotate(angle + 90) // facing mid
                image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                pop()
                for (let i = 1; i < 3; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()

                let AoEsize = 140*scalingFactor // very important to get spread AoE size correct
                angleMode(RADIANS)
                // mark whoever got targeted first
                if (dpsOrSupportsFirst === "supports") {
                    displayTargetSymbol(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1])
                    displayTargetSymbol(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1])
                    displayTargetSymbol(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1])
                    displayTargetSymbol(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1])
                    displaySpreadMarker(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                } if (dpsOrSupportsFirst === "DPS") {
                    displayTargetSymbol(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1])
                    displayTargetSymbol(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1])
                    displayTargetSymbol(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1])
                    displayTargetSymbol(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1])
                    displaySpreadMarker(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                }
                angleMode(DEGREES)

                // get everyone to the correct place
                let innerRadius = mainBodyWidth/6
                let outerRadius = 5*mainBodyWidth/13
                if (dpsOrSupportsFirst === "supports") {
                    setPositionsWithVariance(["M1", "M2"], -innerRadius, 0, 20*scalingFactor, 20*scalingFactor)
                    setPositionsWithVariance(["R1", "R2"], outerRadius, 0, 20*scalingFactor, 20*scalingFactor)
                    H1 = [cos(-120)*outerRadius, sin(-120)*outerRadius]
                    H2 = [cos(120)*outerRadius, sin(120)*outerRadius]
                    MT = [cos(-45)*innerRadius, sin(-45)*innerRadius]
                    OT = [cos(45)*innerRadius, sin(45)*innerRadius]
                } if (dpsOrSupportsFirst === "DPS") {
                    setPositionsWithVariance(["MT", "OT"], innerRadius, 0, 20*scalingFactor, 20*scalingFactor)
                    setPositionsWithVariance(["H1", "H2"], -outerRadius, 0, 20*scalingFactor, 20*scalingFactor)
                    R1 = [cos(-60)*outerRadius, sin(-60)*outerRadius]
                    R2 = [cos(60)*outerRadius, sin(60)*outerRadius]
                    M1 = [cos(-135)*innerRadius, sin(-135)*innerRadius]
                    M2 = [cos(135)*innerRadius, sin(135)*innerRadius]
                }

                setPosition(role, mouseX - centerOfBoard[0], mouseY - centerOfBoard[1])

                stage = 1.5
                return
            } if (stage === 1.5) {
                // display 3 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                push()
                translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                rotate(angle + 90) // facing mid
                image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                pop()
                for (let i = 1; i < 3; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()

                let AoEsize = 140*scalingFactor // very important to get spread AoE size correct
                angleMode(RADIANS)
                // mark whoever got targeted first
                if (dpsOrSupportsFirst === "supports") {
                    displayTargetSymbol(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1])
                    displayTargetSymbol(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1])
                    displayTargetSymbol(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1])
                    displayTargetSymbol(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1])
                    displaySpreadMarker(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                } if (dpsOrSupportsFirst === "DPS") {
                    displayTargetSymbol(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1])
                    displayTargetSymbol(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1])
                    displayTargetSymbol(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1])
                    displayTargetSymbol(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1])
                    displaySpreadMarker(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                }
                angleMode(DEGREES)

                if (belowPositioningThreshold(0.5*scalingFactor, [
                    [MT, realMT],
                    [OT, realOT],
                    [H1, realH1],
                    [H2, realH2],
                    [M1, realM1],
                    [M2, realM2],
                    [R1, realR1],
                    [R2, realR2]
                ])) {
                    stage = 1.75
                    framesWhenKnockbackStarted = frameCount
                    return
                }
            } if (stage === 1.75) {
                // display 4 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                push()
                translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                rotate(angle + 90) // facing mid
                image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                pop()
                for (let i = 1; i < 4; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()

                let AoEsize = 140*scalingFactor // very important to get spread AoE size correct
                angleMode(RADIANS)
                // mark whoever got targeted first
                if (dpsOrSupportsFirst === "supports") {
                    displayTargetSymbol(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1])
                    displayTargetSymbol(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1])
                    displayTargetSymbol(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1])
                    displayTargetSymbol(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1])
                    displaySpreadMarker(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                } if (dpsOrSupportsFirst === "DPS") {
                    displayTargetSymbol(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1])
                    displayTargetSymbol(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1])
                    displayTargetSymbol(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1])
                    displayTargetSymbol(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1])
                    displaySpreadMarker(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                }
                angleMode(DEGREES)

                // animation for knockback: rotating low-opacity dark-green
                // cone with a small opaque bright green spot going outwards
                if (frameCount - framesWhenKnockbackStarted < 50) {
                    let framesSinceKnockbackStarted = frameCount - framesWhenKnockbackStarted

                    // rotate 10º every frame and draw 4 10º arcs
                    // also draw a fully opaque arc on each other arc going
                    // outwards and rotating along
                    push()
                    translateToCenterOfBoard()
                    rotate(framesSinceKnockbackStarted*10)
                    noStroke()
                    fill(120, 100, 30, min(40, map(framesSinceKnockbackStarted, 0, 50, 500, 0)))
                    arc(0, 0, mainBodyWidth*10, mainBodyWidth*10, 0, 10)
                    arc(0, 0, mainBodyWidth*10, mainBodyWidth*10, 90, 100)
                    arc(0, 0, mainBodyWidth*10, mainBodyWidth*10, 180, 190)
                    arc(0, 0, mainBodyWidth*10, mainBodyWidth*10, 270, 280)
                    noFill()
                    stroke(120, 100, 100)
                    strokeWeight(6*scalingFactor)
                    arc(0, 0, map(framesSinceKnockbackStarted, 0, 50, 0, mainBodyWidth), map(framesSinceKnockbackStarted, 0, 50, 0, mainBodyWidth), 0, 10, OPEN)
                    arc(0, 0, map(framesSinceKnockbackStarted, 0, 50, 0, mainBodyWidth), map(framesSinceKnockbackStarted, 0, 50, 0, mainBodyWidth), 90, 100, OPEN)
                    arc(0, 0, map(framesSinceKnockbackStarted, 0, 50, 0, mainBodyWidth), map(framesSinceKnockbackStarted, 0, 50, 0, mainBodyWidth), 180, 190, OPEN)
                    arc(0, 0, map(framesSinceKnockbackStarted, 0, 50, 0, mainBodyWidth), map(framesSinceKnockbackStarted, 0, 50, 0, mainBodyWidth), 270, 280, OPEN)
                    pop()
                } else if (frameCount - framesWhenKnockbackStarted < 150) {
                    if (frameCount - framesWhenKnockbackStarted > 70) {
                        let framesSinceKnockbackStarted = frameCount - framesWhenKnockbackStarted

                        // second part of knockback animation: just draw a
                        // circle going out. erase the one drawn 5 frames before it
                        push()
                        translateToCenterOfBoard()
                        noFill()
                        stroke(120, 100, 100, 20)
                        strokeWeight(mainBodyWidth / 10)
                        if (framesSinceKnockbackStarted < 110) circle(0, 0, (framesSinceKnockbackStarted - 80) * mainBodyWidth / 10)
                        erase()
                        if (framesSinceKnockbackStarted > 85) circle(0, 0, (framesSinceKnockbackStarted - 85) * mainBodyWidth / 10)
                        noErase()
                        pop()
                    }
                } else {
                    // erase()
                    // fill(0, 0, 0)
                    // rect(0, 0, width, height)
                    // noErase()
                    stage = 1.8
                }
            } if (stage === 1.8) {
                // display 5 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                push()
                translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                rotate(angle + 90) // facing mid
                image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                pop()
                for (let i = 1; i < 5; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()

                let AoEsize = 140*scalingFactor // very important to get spread AoE size correct
                let imageSize = AoEsize*1.25 // the image has blank space at the edges
                // display on whoever got targetted first
                if (dpsOrSupportsFirst === "supports") { // rotate by 15 each frame
                    displayRotatedImage(gustImage, realH1.x + centerOfBoard[0] - imageSize/2, realH1.y + centerOfBoard[1] - imageSize/2, imageSize, imageSize, random(0, 360))
                    displayRotatedImage(gustImage, realH2.x + centerOfBoard[0] - imageSize/2, realH2.y + centerOfBoard[1] - imageSize/2, imageSize, imageSize, random(0, 360))
                    displayRotatedImage(gustImage, realMT.x + centerOfBoard[0] - imageSize/2, realMT.y + centerOfBoard[1] - imageSize/2, imageSize, imageSize, random(0, 360))
                    displayRotatedImage(gustImage, realOT.x + centerOfBoard[0] - imageSize/2, realOT.y + centerOfBoard[1] - imageSize/2, imageSize, imageSize, random(0, 360))
                } if (dpsOrSupportsFirst === "DPS") {
                    displayRotatedImage(gustImage, realM1.x + centerOfBoard[0] - imageSize/2, realM1.y + centerOfBoard[1] - imageSize/2, imageSize, imageSize, random(0, 360))
                    displayRotatedImage(gustImage, realM2.x + centerOfBoard[0] - imageSize/2, realM2.y + centerOfBoard[1] - imageSize/2, imageSize, imageSize, random(0, 360))
                    displayRotatedImage(gustImage, realR1.x + centerOfBoard[0] - imageSize/2, realR1.y + centerOfBoard[1] - imageSize/2, imageSize, imageSize, random(0, 360))
                    displayRotatedImage(gustImage, realR2.x + centerOfBoard[0] - imageSize/2, realR2.y + centerOfBoard[1] - imageSize/2, imageSize, imageSize, random(0, 360))
                }

                // display the line AoE too
                image(m8sP1LineAoE, centerOfBoard[0] - mainBodyWidth*6/13, centerOfBoard[1] - mainBodyWidth*6/13, mainBodyWidth*12/13, mainBodyWidth*12/13)

                // this is just a stage to display the spread AoEs for 30 frames
                if (frameCount - framesWhenKnockbackStarted > 180) {
                    stage = 2
                    textAtTop = "It's time to rotate. Click anywhere inside the green dot to move there."
                    return
                }
            } if (stage === 2) {
                // display 5 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                // do not display the first wolf head
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                // push()
                // translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                // rotate(angle + 90) // facing mid
                // image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                // pop()
                for (let i = 1; i < 5; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()
                

                let innerRadius = mainBodyWidth/6
                let mediumRadius = 2*mainBodyWidth/7
                let outerRadius = 5*mainBodyWidth/13

                // mark whoever got targeted second
                angleMode(RADIANS)
                let AoEsize = 140*scalingFactor
                if (dpsOrSupportsFirst === "DPS") {
                    displayTargetSymbol(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1])
                    displayTargetSymbol(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1])
                    displayTargetSymbol(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1])
                    displayTargetSymbol(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1])
                    displaySpreadMarker(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                } if (dpsOrSupportsFirst === "supports") {
                    displayTargetSymbol(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1])
                    displayTargetSymbol(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1])
                    displayTargetSymbol(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1])
                    displayTargetSymbol(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1])
                    displaySpreadMarker(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                }
                angleMode(DEGREES)

                // add a huge green dot
                displayCustomizableGreenDot(yourPosition()[0], yourPosition()[1], 250*scalingFactor)

                // if you click anywhere on it, move to that location
                if (mousePressedButNotHeldDown()) {
                    if (inClickingRange(translateXYPositionToStandardFormat(yourPosition()), 125 * scalingFactor)) {
                        let selectedPosition = translateXYPositionToBoardCenterFormat([mouseX, mouseY])


                        stage = 2.5
                        textAtTop = "Please wait for people to get into" +
                            " their spot."
                        textAtBottom = "You are rotating properly. \n[PASS]" +
                            " — You are on the correct side. \n[PASS] — You" +
                            " are not in the death wall."

                        // preform a few checks on the location. make sure
                        // it's valid
                        // 1. position is hit by line AoE. easily doable
                        //    orient to line AoE. if your x-position is
                        //    greater than -3*mainBodyWidth/26 or
                        //    less than 3*mainBodyWidth/26, you got hit.
                        //    the line is exactly 1/4 of the arena, except
                        //    that it is drawn at 12/13 size, resulting in 3/26.

                        // 2. you crossed line AoE. use same as 1st position.
                        //    if your x-position is greater than
                        //    3*mainBodyWidth/26 for melees/healers or
                        //    less than -3*mainBodyWidth/26 for tanks/melees,
                        //    you crossed the line AoE. note this only matters
                        //    if you have first spread aoe.

                        // 3. you entered the death wall. the arena is a
                        //    499x499 image and the death wall is 46 pixels
                        //    away from the top. that means you entered the
                        //    death wall if you're more than 2*46/499*mbw away
                        //    from the center. that's 92/499*mbw radius

                        // 4. the position is approved by the hedgehogs🦔🦔🦔🦔
                        //    only applicable for 4th line AoE🦔🦔🦔🦔

                        // check 1
                        // to orient a position to the line AoE, first
                        // convert the position to Rθ format (distance
                        // angle), subtract the angle of the line AoE from
                        // θ, and then convert back to xy format. then do
                        // the check.
                        // first, find the angle of the line AoE
                        // note that the line AoE angle is always north at
                        // the start. otherwise you get finnicky things
                        // where if it's south, the other side is correct.
                        // just...orient to the top of hte line aoe.

                        // then, translate the position to Rθ format
                        let selectedPositionRθ = translateXYPositionToRθFormat(selectedPosition)

                        // subtract the angle by the angle of the line AoE
                        let modifiedPositionRθ = [selectedPositionRθ[0], selectedPositionRθ[1] - (wolfHeadRotation === "ccw" ? 36 : -36)]

                        // then in order to check anything you have to
                        // convert it back to xy format
                        let modifiedPosition = translateRθPositionToXYFormat(modifiedPositionRθ)

                        print(selectedPosition, selectedPositionRθ, modifiedPositionRθ, modifiedPosition)

                        // if the x is within 3*mainBodyWidth/26 of the
                        // center, then tell them
                        if (modifiedPosition[0] > -3*mainBodyWidth/26 && modifiedPosition[0] < 3*mainBodyWidth/26) {
                            stage = 100
                            updateLosses(1)
                            textAtTop = "That location is clipped by the line AoE."
                            textAtBottom = "You went into the line AoE. \n" +
                                "[FAIL] — That location is clipped by the line AoE."
                        }

                        // check 2
                        // we can basically use the same checks that we did
                        // earlier
                        // if the position is > 3*mainBodyWidth/26 for melees
                        // and healers or < -3*mainBodyWidth/26 for tanks
                        // and ranged, you accidentally crossed sides
                        // going in between those ranges will fail check 1
                        // if you had the first spread, you don't have to
                        // avoid crossing sides
                        if (DPSOrSupports(role) !== dpsOrSupportsFirst) {
                            if (modifiedPosition[0] > 3 * mainBodyWidth / 26) {
                                // Did you know that checkEqualities can also be
                                // used for checking roles?
                                if (checkEqualities(role, ["M1", "M2", "H1", "H2"])) {
                                    stage = 100
                                    updateLosses(1)
                                    textAtTop = "Melees and healers should" +
                                        " stay to the left of the line AoE" +
                                        " if they have second spreads."
                                    textAtBottom = "You went to the wrong" +
                                        " side. \n[FAIL] — Melees and" +
                                        " healers should stay to the left if" +
                                        " they have the second spread."
                                }
                            } if (modifiedPosition[0] < -3 * mainBodyWidth / 26) {
                                if (checkEqualities(role, ["MT", "OT", "R1", "R2"])) {
                                    stage = 100
                                    updateLosses(1)
                                    textAtTop = "Tanks and ranged should" +
                                        " stay to the left of the line AoE" +
                                        " if they have second spreads."
                                    textAtBottom = "You went to the wrong" +
                                        " side. \n[FAIL] — Tanks and" +
                                        " ranged should stay to the right if" +
                                        " they have the second spread."
                                }
                            }
                        }

                        // now it's time to add the other people. ...sigh
                        // Permutation 1: Supports First, Rotate Clockwise
                        if (dpsOrSupportsFirst === "supports" && actualWolfHeadRotation === "cw") {
                            // remove all variance first
                            setPositionsWithVariance(["M1", "M2"], -innerRadius, 0, 0, 0)
                            setPositionsWithVariance(["R1", "R2"], outerRadius, 0, 0, 0)

                            setPosition("MT", MT[0] + 10*scalingFactor, 0)
                            movePosition("OT", -10*scalingFactor, 0)
                            movePosition("H1", 30*scalingFactor, -10*scalingFactor)
                            setPosition("H2", 0, H2[1] + 5*scalingFactor)
                            movePosition("M1", 45*scalingFactor, -50*scalingFactor)
                            movePosition("M2", 10*scalingFactor, -20*scalingFactor)
                            movePosition("R1", -20*scalingFactor, 30*scalingFactor)
                            movePosition("R2", -100*scalingFactor, 60*scalingFactor)
                        }
                        // Permutation 2: Supports First, Rotate Counterclockwise
                        if (dpsOrSupportsFirst === "supports" && actualWolfHeadRotation === "ccw") {
                            // remove all variance first
                            setPositionsWithVariance(["M1", "M2"], -innerRadius, 0, 0, 0)
                            setPositionsWithVariance(["R1", "R2"], outerRadius, 0, 0, 0)

                            setPosition("OT", OT[0] + 10*scalingFactor, 0)
                            movePosition("MT", -10*scalingFactor, 0)
                            movePosition("H2", 30*scalingFactor, 10*scalingFactor)
                            setPosition("H1", 0, H1[1] - 5*scalingFactor)
                            movePosition("M2", 45*scalingFactor, 50*scalingFactor)
                            movePosition("M1", 10*scalingFactor, 20*scalingFactor)
                            movePosition("R2", -20*scalingFactor, -30*scalingFactor)
                            movePosition("R1", -100*scalingFactor, -60*scalingFactor)
                        }
                        // Permutation 3: DPS First, Rotate Clockwise
                        if (dpsOrSupportsFirst === "DPS" && actualWolfHeadRotation === "ccw") {
                            // remove all variance first
                            setPositionsWithVariance(["MT", "OT"], innerRadius, 0, 0, 0)
                            setPositionsWithVariance(["H1", "H2"], -outerRadius, 0, 0, 0)

                            setPosition("M1", M1[0] - 10*scalingFactor, 0)
                            movePosition("M2", 10*scalingFactor, 0)
                            movePosition("R1", -30*scalingFactor, -10*scalingFactor)
                            setPosition("R2", 0, R2[1] + 5*scalingFactor)
                            movePosition("MT", -45*scalingFactor, -50*scalingFactor)
                            movePosition("OT", -10*scalingFactor, -20*scalingFactor)
                            movePosition("H1", 20*scalingFactor, 30*scalingFactor)
                            movePosition("H2", 100*scalingFactor, 60*scalingFactor)
                        }
                        // Permutation 4: DPS First, Rotate Counterclockwise
                        if (dpsOrSupportsFirst === "DPS" && actualWolfHeadRotation === "cw") {
                            // remove all variance first
                            setPositionsWithVariance(["MT", "OT"], innerRadius, 0, 0, 0)
                            setPositionsWithVariance(["H1", "H2"], -outerRadius, 0, 0, 0)

                            setPosition("M2", M2[0] - 10*scalingFactor, 0)
                            movePosition("M1", 10*scalingFactor, 0)
                            movePosition("R2", -30*scalingFactor, 10*scalingFactor)
                            setPosition("R1", 0, R1[1] - 5*scalingFactor)
                            movePosition("OT", -45*scalingFactor, 50*scalingFactor)
                            movePosition("MT", -10*scalingFactor, 20*scalingFactor)
                            movePosition("H2", 20*scalingFactor, -30*scalingFactor)
                            movePosition("H1", 100*scalingFactor, -60*scalingFactor)
                        }
                        // make sure to overwrite your default spot
                        setPosition(role, ...translateXYPositionToBoardCenterFormat([mouseX, mouseY]))

                        if (stage !== 100) stage = 2.5
                        return
                        // the standard is always to return so that you
                        // can't accidentally press two stages at a time
                    }
                }
            } if (stage === 2.5) { // wait until everyone goes
                // display 5 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                // do not display the first wolf head
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                // push()
                // translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                // rotate(angle + 90) // facing mid
                // image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                // pop()
                for (let i = 1; i < 5; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()

                // mark whoever got targeted second
                angleMode(RADIANS)
                let AoEsize = 140*scalingFactor
                if (dpsOrSupportsFirst === "DPS") {
                    displayTargetSymbol(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1])
                    displayTargetSymbol(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1])
                    displayTargetSymbol(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1])
                    displayTargetSymbol(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1])
                    displaySpreadMarker(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                } if (dpsOrSupportsFirst === "supports") {
                    displayTargetSymbol(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1])
                    displayTargetSymbol(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1])
                    displayTargetSymbol(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1])
                    displayTargetSymbol(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1])
                    displaySpreadMarker(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                }
                angleMode(DEGREES)

                if (belowPositioningThreshold(0.5*scalingFactor, [
                    [MT, realMT],
                    [OT, realOT],
                    [H1, realH1],
                    [H2, realH2],
                    [M1, realM1],
                    [M2, realM2],
                    [R1, realR1],
                    [R2, realR2]
                ])) {
                    stage = 2.75
                    return
                }
            } if (stage === 2.75) { // display the line AoE
                // display 5 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                // do not display the first wolf head
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                // push()
                // translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                // rotate(angle + 90) // facing mid
                // image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                // pop()
                for (let i = 2; i < 5; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()

                // mark whoever got targeted second
                angleMode(RADIANS)
                let AoEsize = 140*scalingFactor
                if (dpsOrSupportsFirst === "DPS") {
                    displayTargetSymbol(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1])
                    displayTargetSymbol(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1])
                    displayTargetSymbol(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1])
                    displayTargetSymbol(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1])
                    displaySpreadMarker(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                } if (dpsOrSupportsFirst === "supports") {
                    displayTargetSymbol(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1])
                    displayTargetSymbol(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1])
                    displayTargetSymbol(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1])
                    displayTargetSymbol(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1])
                    displaySpreadMarker(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                }
                angleMode(DEGREES)

                let innerRadius = mainBodyWidth/6
                let mediumRadius = 2*mainBodyWidth/7
                let outerRadius = 5*mainBodyWidth/13

                tint(0, 0, 100, 100)
                displayRotatedImage(m8sP1LineAoE, centerOfBoard[0] - mainBodyWidth*6/13, centerOfBoard[1] - mainBodyWidth*6/13, mainBodyWidth*12/13, mainBodyWidth*12/13, (wolfHeadRotation === "ccw" ? 36 : -36))
                stage = 3
            } if (stage === 3) {
                // this is basically just equivalent to stage 2
                // display 5 wolf heads
                // the way we do this is always to translate to a certain
                // place, rotate, and then display
                // do not display the first wolf head
                tint(0, 0, 100, 50)
                push()
                translateToCenterOfBoard()
                let wolfHeadSize = 60*scalingFactor
                let wolfHeadSpawnRadius = 6*mainBodyWidth/13
                let angle = (northOrSouth === "N" ? -90 : 90) // angle where the wolf head spawns
                // push()
                // translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                // rotate(angle + 90) // facing mid
                // image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                // pop()
                for (let i = 1; i < 5; i++) {
                    // then rotate
                    angle += (wolfHeadRotation === "ccw" ? 36 : -36)
                    push()
                    translate(cos(angle)*wolfHeadSpawnRadius, sin(angle)*wolfHeadSpawnRadius)
                    rotate(angle + 90) // facing mid
                    image(m8sP1WolfHead, -wolfHeadSize/2, -wolfHeadSize/2, wolfHeadSize, wolfHeadSize)
                    pop()
                }
                pop()


                let innerRadius = mainBodyWidth/6
                let mediumRadius = 2*mainBodyWidth/7
                let outerRadius = 5*mainBodyWidth/13

                // mark whoever got targeted second
                angleMode(RADIANS)
                let AoEsize = 140*scalingFactor
                if (dpsOrSupportsFirst === "DPS") {
                    displayTargetSymbol(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1])
                    displayTargetSymbol(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1])
                    displayTargetSymbol(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1])
                    displayTargetSymbol(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1])
                    displaySpreadMarker(realH1.x + centerOfBoard[0], realH1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realH2.x + centerOfBoard[0], realH2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realMT.x + centerOfBoard[0], realMT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realOT.x + centerOfBoard[0], realOT.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                } if (dpsOrSupportsFirst === "supports") {
                    displayTargetSymbol(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1])
                    displayTargetSymbol(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1])
                    displayTargetSymbol(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1])
                    displayTargetSymbol(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1])
                    displaySpreadMarker(realM1.x + centerOfBoard[0], realM1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realM2.x + centerOfBoard[0], realM2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR1.x + centerOfBoard[0], realR1.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                    displaySpreadMarker(realR2.x + centerOfBoard[0], realR2.y + centerOfBoard[1], AoEsize, 300, 20, 100)
                }
                angleMode(DEGREES)

                // add a huge green dot
                displayCustomizableGreenDot(yourPosition()[0], yourPosition()[1], 250*scalingFactor)

                // if you click anywhere on it, move to that location
                if (mousePressedButNotHeldDown()) {
                    if (inClickingRange(translateXYPositionToStandardFormat(yourPosition()), 125 * scalingFactor)) {
                        let selectedPosition = translateXYPositionToBoardCenterFormat([mouseX, mouseY])


                        stage = 3.5
                        textAtTop = "Please wait for people to get into" +
                            " their spot."
                        textAtBottom = "You are rotating properly. \n[PASS]" +
                            " — You are on the correct side. \n[PASS] — You" +
                            " are not in the death wall."

                        // preform a few checks on the location. make sure
                        // it's valid
                        // 1. position is hit by line AoE. easily doable
                        //    orient to line AoE. if your x-position is
                        //    greater than -3*mainBodyWidth/26 or
                        //    less than 3*mainBodyWidth/26, you got hit.
                        //    the line is exactly 1/4 of the arena, except
                        //    that it is drawn at 12/13 size, resulting in 3/26.

                        // 2. you crossed line AoE. use same as 1st position.
                        //    if your x-position is greater than
                        //    3*mainBodyWidth/26 for melees/healers or
                        //    less than -3*mainBodyWidth/26 for tanks/melees,
                        //    you crossed the line AoE. note this only matters
                        //    if you have first spread aoe.

                        // 3. you entered the death wall. the arena is a
                        //    499x499 image and the death wall is 46 pixels
                        //    away from the top. that means you entered the
                        //    death wall if you're more than 2*46/499*mbw away
                        //    from the center. that's 92/499*mbw radius

                        // 4. the position is approved by the hedgehogs🦔🦔🦔🦔
                        //    only applicable for 4th line AoE🦔🦔🦔🦔

                        // check 1
                        // to orient a position to the line AoE, first
                        // convert the position to Rθ format (distance
                        // angle), subtract the angle of the line AoE from
                        // θ, and then convert back to xy format. then do
                        // the check.
                        // first, find the angle of the line AoE
                        // note that the line AoE angle is always north at
                        // the start. otherwise you get finnicky things
                        // where if it's south, the other side is correct.
                        // just...orient to the top of hte line aoe.

                        // then, translate the position to Rθ format
                        let selectedPositionRθ = translateXYPositionToRθFormat(selectedPosition)

                        // subtract the angle by the angle of the line AoE
                        let modifiedPositionRθ = [selectedPositionRθ[0], selectedPositionRθ[1] - (wolfHeadRotation === "ccw" ? 72 : -72)]

                        // then in order to check anything you have to
                        // convert it back to xy format
                        let modifiedPosition = translateRθPositionToXYFormat(modifiedPositionRθ)

                        print(selectedPosition, selectedPositionRθ, modifiedPositionRθ, modifiedPosition)

                        // if the x is within 3*mainBodyWidth/26 of the
                        // center, then tell them
                        if (modifiedPosition[0] > -3*mainBodyWidth/26 && modifiedPosition[0] < 3*mainBodyWidth/26) {
                            stage = 100
                            updateLosses(1)
                            textAtTop = "That location is clipped by the line AoE."
                            textAtBottom = "You went into the line AoE. \n" +
                                "[FAIL] — That location is clipped by the line AoE."
                        }

                        // check 2
                        // we can basically use the same checks that we did
                        // earlier
                        // if the position is > 3*mainBodyWidth/26 for melees
                        // and healers or < -3*mainBodyWidth/26 for tanks
                        // and ranged, you accidentally crossed sides
                        // going in between those ranges will fail check 1
                        // if you had the first spread, you don't have to
                        // avoid crossing sides
                        if (DPSOrSupports(role) !== dpsOrSupportsFirst) {
                            if (modifiedPosition[0] > 3 * mainBodyWidth / 26) {
                                // Did you know that checkEqualities can also be
                                // used for checking roles?
                                if (checkEqualities(role, ["M1", "M2", "H1", "H2"])) {
                                    stage = 100
                                    updateLosses(1)
                                    textAtTop = "Melees and healers should" +
                                        " stay to the left of the line AoE" +
                                        " if they have second spreads."
                                    textAtBottom = "You went to the wrong" +
                                        " side. \n[FAIL] — Melees and" +
                                        " healers should stay to the left if" +
                                        " they have the second spread."
                                }
                            } if (modifiedPosition[0] < -3 * mainBodyWidth / 26) {
                                if (checkEqualities(role, ["MT", "OT", "R1", "R2"])) {
                                    stage = 100
                                    updateLosses(1)
                                    textAtTop = "Tanks and ranged should" +
                                        " stay to the left of the line AoE" +
                                        " if they have second spreads."
                                    textAtBottom = "You went to the wrong" +
                                        " side. \n[FAIL] — Tanks and" +
                                        " ranged should stay to the right if" +
                                        " they have the second spread."
                                }
                            }
                        }

                        // now it's time to add the other people. ...sigh
                        // Permutation 1: Supports First, Rotate Clockwise
                        if (dpsOrSupportsFirst === "supports" && actualWolfHeadRotation === "cw") {
                            setPosition("MT", MT[0] + 10*scalingFactor, 0)
                            movePosition("OT", -10*scalingFactor, 0)
                            movePosition("H1", 30*scalingFactor, -10*scalingFactor)
                            setPosition("H2", 0, H2[1] + 5*scalingFactor)
                            movePosition("M1", 45*scalingFactor, -50*scalingFactor)
                            movePosition("M2", 10*scalingFactor, -20*scalingFactor)
                            movePosition("R1", -20*scalingFactor, 30*scalingFactor)
                            movePosition("R2", -100*scalingFactor, 60*scalingFactor)
                        }
                        // Permutation 2: Supports First, Rotate Counterclockwise
                        if (dpsOrSupportsFirst === "supports" && actualWolfHeadRotation === "ccw") {
                            setPosition("OT", OT[0] + 10*scalingFactor, 0)
                            movePosition("MT", -10*scalingFactor, 0)
                            movePosition("H2", 30*scalingFactor, 10*scalingFactor)
                            setPosition("H1", 0, H1[1] - 5*scalingFactor)
                            movePosition("M2", 45*scalingFactor, 50*scalingFactor)
                            movePosition("M1", 10*scalingFactor, 20*scalingFactor)
                            movePosition("R2", -20*scalingFactor, -30*scalingFactor)
                            movePosition("R1", -100*scalingFactor, -60*scalingFactor)
                        }
                        // Permutation 3: DPS First, Rotate Clockwise
                        if (dpsOrSupportsFirst === "DPS" && actualWolfHeadRotation === "ccw") {
                            setPosition("M1", M1[0] - 10*scalingFactor, 0)
                            movePosition("M2", 10*scalingFactor, 0)
                            movePosition("R1", -30*scalingFactor, -10*scalingFactor)
                            setPosition("R2", 0, R2[1] + 5*scalingFactor)
                            movePosition("MT", -45*scalingFactor, -50*scalingFactor)
                            movePosition("OT", -10*scalingFactor, -20*scalingFactor)
                            movePosition("H1", 20*scalingFactor, 30*scalingFactor)
                            movePosition("H2", 100*scalingFactor, 60*scalingFactor)
                        }
                        // Permutation 4: DPS First, Rotate Counterclockwise
                        if (dpsOrSupportsFirst === "DPS" && actualWolfHeadRotation === "cw") {
                            setPosition("M2", M2[0] - 10*scalingFactor, 0)
                            movePosition("M1", 10*scalingFactor, 0)
                            movePosition("R2", -30*scalingFactor, 10*scalingFactor)
                            setPosition("R1", 0, R1[1] - 5*scalingFactor)
                            movePosition("OT", -45*scalingFactor, 50*scalingFactor)
                            movePosition("MT", -10*scalingFactor, 20*scalingFactor)
                            movePosition("H2", 20*scalingFactor, -30*scalingFactor)
                            movePosition("H1", 100*scalingFactor, -60*scalingFactor)
                        }
                        // make sure to overwrite your default spot
                        setPosition(role, ...translateXYPositionToBoardCenterFormat([mouseX, mouseY]))

                        if (stage !== 100) stage = 3.5
                        return
                        // the standard is always to return so that you
                        // can't accidentally press two stages at a time
                    }
                }
            }
        }
        angleMode(RADIANS)
    }
}

function displayMechanicSelection() {
    // make it look like there are buttons!
    fill(0, 0, 50)
    noStroke()
    textAlign(LEFT, TOP)
    textSize(10*scalingFactor)

    // display what's underneath the button first
    push()
    translate(0, 3)
    fill(0, 0, 25)
    rect(selectionX + textPadding + textWidth("M8S:"), selectionY + mechanicSelectionHeight - 65*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("M8S: Millennial Decay "), selectionY + mechanicSelectionHeight - 52*scalingFactor - textPadding, 5)
    rect(selectionX + textPadding + textWidth("M6S:"), selectionY + mechanicSelectionHeight - 52*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("M6S: Wingmark "), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding, 5)
    rect(selectionX + textPadding + textWidth("FRU:"), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("FRU: Utopian Sky "), selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding, 5)
    rect(selectionX + textPadding + textWidth("FRU: Utopian Sky  "), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust "), selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding, 5)
    rect(selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust  "), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust   Mirror Mirror "), selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding, 5)
    pop()

    // then display the actual buttons
    rect(selectionX + textPadding + textWidth("M8S:"), selectionY + mechanicSelectionHeight - 65*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("M8S: Millennial Decay "), selectionY + mechanicSelectionHeight - 52*scalingFactor - textPadding, 5)
    rect(selectionX + textPadding + textWidth("M6S:"), selectionY + mechanicSelectionHeight - 52*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("M6S: Wingmark "), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding, 5)
    rect(selectionX + textPadding + textWidth("FRU:"), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("FRU: Utopian Sky "), selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding, 5)
    rect(selectionX + textPadding + textWidth("FRU: Utopian Sky  "), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust "), selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding, 5)
    rect(selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust  "), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding,
        selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust   Mirror Mirror "), selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding, 5)



    // now display the mechanic text
    fill(0, 0, 100)
    text("M8S: Millennial Decay \n" +
        "M6S: Wingmark \n" +
        "FRU: Utopian Sky   Diamond Dust   Mirror Mirror \n" +
        "\n" +
        "Who knows, maybe there'll be other mechanics soon.",
        selectionX + textPadding, selectionY + textPadding)

    // now make the buttons clickable
    fill(0, 0, 0, 30)
    if (mouseX > selectionX + textPadding && mouseX < selectionX + selectionWidth + textPadding) {
        // major update: rows are now done as "number of rows from bottom",
        // otherwise things can get messy

        // row -5
        if (mouseY > selectionY + mechanicSelectionHeight - 65*scalingFactor - textPadding && mouseY < selectionY + mechanicSelectionHeight - 52*scalingFactor - textPadding) {
            if (mouseX > selectionX + textPadding + textWidth("M8S:") &&
                mouseX < selectionX + textPadding + textWidth("M8S: Millennial Decay ")) {
                rect(selectionX + textPadding + textWidth("M8S:"), selectionY + mechanicSelectionHeight - 65*scalingFactor - textPadding,
                    selectionX + textPadding + textWidth("M8S: Millennial Decay "), selectionY + mechanicSelectionHeight - 52*scalingFactor - textPadding)
                if (mousePressedButNotHeldDown()) {
                    setupMillennialDecay()
                }
            }
        }
        // row -4
        if (mouseY > selectionY + mechanicSelectionHeight - 52*scalingFactor - textPadding && mouseY < selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding) {
            if (mouseX > selectionX + textPadding + textWidth("M6S:") &&
                mouseX < selectionX + textPadding + textWidth("M6S: Wingmark ")) {
                rect(selectionX + textPadding + textWidth("M6S:"), selectionY + mechanicSelectionHeight - 52*scalingFactor - textPadding,
                    selectionX + textPadding + textWidth("M6S: Wingmark "), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding)
                if (mousePressedButNotHeldDown()) {
                    setupWingmark()
                }
            }
        }
        // row -3
        if (mouseY > selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding && mouseY < selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding) {
            if (mouseX > selectionX + textPadding + textWidth("FRU:") &&
                mouseX < selectionX + textPadding + textWidth("FRU: Utopian Sky ")) {
                rect(selectionX + textPadding + textWidth("FRU:"), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding,
                    selectionX + textPadding + textWidth("FRU: Utopian Sky "), selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding)
                if (mousePressedButNotHeldDown()) {
                    setupUtopianSky()
                }
            }
            if (mouseX > selectionX + textPadding + textWidth("FRU: Utopian Sky  ") &&
                mouseX < selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust ")) {
                rect(selectionX + textPadding + textWidth("FRU: Utopian Sky  "), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding,
                    selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust "), selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding)
                if (mousePressedButNotHeldDown()) {
                    setupDiamondDust()
                }
            }
            if (mouseX > selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust  ") &&
                mouseX < selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust   Mirror Mirror ")) {
                rect(selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust  "), selectionY + mechanicSelectionHeight - 39*scalingFactor - textPadding,
                    selectionX + textPadding + textWidth("FRU: Utopian Sky   Diamond Dust   Mirror Mirror "), selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding)
                if (mousePressedButNotHeldDown()) {
                    setupMirrorMirror()
                }
            }
        }
        // row -2
        if (mouseY > selectionY + mechanicSelectionHeight - 26*scalingFactor - textPadding && mouseY < selectionY + mechanicSelectionHeight - 13*scalingFactor - textPadding) {
        }
        // row -1
        if (mouseY > selectionY + mechanicSelectionHeight - 13*scalingFactor - textPadding && mouseY < selectionY + mechanicSelectionHeight - 0*scalingFactor - textPadding) {
        }
    }


    textSize(7*scalingFactor)
}

function displayBottomWindowContent() {
    // before we display any text, we should set the background
    if (stage < 99) { // stage < 99 indicates you're still on track
        fill(120, 100, 50, 50)
    } if (stage === 99) { // if stage is 99, you've completed the mechanic
        fill(240, 100, 50, 50)
    } if (stage > 99) { // if stage is greater than 99, you failed the mechanic in some way
        fill(0, 100, 50, 50)
    }
    noStroke()
    rect(bottomWindowX, bottomWindowY, bottomWindowX + bottomWidth, bottomWindowY + bottomHeight, cornerRounding)

    fill(0, 0, 100)
    text(textAtBottom, bottomWindowX + textPadding, bottomWindowY + textPadding)
}

function displayScalingAdjustContent() {
    // display whatever the current scaling factor is
    textAlign(CENTER, CENTER)
    fill(0, 0, 100)
    noStroke()
    textSize(10*scalingFactor)
    text("Scaling Factor\nAdjust\nCurrent: " + parseInt(scalingFactorFetch*100) + "%",
        scalingAdjustX + scalingAdjustWidth/2, scalingAdjustY + scalingAdjustHeight/3)
    textAlign(LEFT, CENTER)
    text("     -50%             -25%  " +
        "                                  +25%          +50%\n" +
        "     -10%              -1%           " +
        "                           +1%          +10%\n\n" +
        "Changes to scaling will take effect on next reload via local storage.",
        scalingAdjustX, scalingAdjustY + scalingAdjustHeight/2)
    textAlign(LEFT, BOTTOM)
    textSize(7*scalingFactor)

    // now that we're done with the text, display the buttons
    // row 1: "-50%", "-25%", "+25%", "+50%"
    fill(0, 0, 0, 50)
    if (mouseY > scalingAdjustY && mouseY < scalingAdjustY + 13*scalingFactor) {
        // -50%
        if (mouseX > scalingAdjustX && mouseX < scalingAdjustX + scalingAdjustWidth/5) {
            rect(scalingAdjustX, scalingAdjustY, scalingAdjustX + scalingAdjustWidth/5, scalingAdjustY + 13*scalingFactor, cornerRounding)
            if (mousePressedButNotHeldDown()) {
                scalingFactorFetch -= 0.5
                scalingFactorFetch = max(scalingFactorFetch, 0.25)
                localStorage.setItem("scalingFactor", scalingFactorFetch)
                return
            }
        }
        // -25%
        if (mouseX > scalingAdjustX + scalingAdjustWidth/5 && mouseX < scalingAdjustX + 2*scalingAdjustWidth/5) {
            rect(scalingAdjustX + scalingAdjustWidth/5, scalingAdjustY, scalingAdjustX + 2*scalingAdjustWidth/5, scalingAdjustY + 13*scalingFactor, cornerRounding)
            if (mousePressedButNotHeldDown()) {
                scalingFactorFetch -= 0.25
                scalingFactorFetch = max(scalingFactorFetch, 0.25)
                localStorage.setItem("scalingFactor", scalingFactorFetch)
                return
            }
        }
        // +25%
        if (mouseX > scalingAdjustX + 3*scalingAdjustWidth/5 && mouseX < scalingAdjustX + 4*scalingAdjustWidth/5) {
            rect(scalingAdjustX + 3*scalingAdjustWidth/5, scalingAdjustY, scalingAdjustX + 4*scalingAdjustWidth/5, scalingAdjustY + 13*scalingFactor, cornerRounding)
            if (mousePressedButNotHeldDown()) {
                scalingFactorFetch += 0.25
                scalingFactorFetch = min(scalingFactorFetch, 10)
                localStorage.setItem("scalingFactor", scalingFactorFetch)
                return
            }
        }
        // +50%
        if (mouseX > scalingAdjustX + 4*scalingAdjustWidth/5 && mouseX < scalingAdjustX + scalingAdjustWidth) {
            rect(scalingAdjustX + 4*scalingAdjustWidth/5, scalingAdjustY, scalingAdjustX + scalingAdjustWidth, scalingAdjustY + 13*scalingFactor, cornerRounding)
            if (mousePressedButNotHeldDown()) {
                scalingFactorFetch += 0.5
                scalingFactorFetch = min(scalingFactorFetch, 10)
                localStorage.setItem("scalingFactor", scalingFactorFetch)
                return
            }
        }
    }
    // row 2: "-10%", "-1%", "+1%", "+10%"
    if (mouseY > scalingAdjustY + 13*scalingFactor && mouseY < scalingAdjustY + 26*scalingFactor) {
        // -10%
        if (mouseX > scalingAdjustX && mouseX < scalingAdjustX + scalingAdjustWidth/5) {
            rect(scalingAdjustX, scalingAdjustY + 13*scalingFactor, scalingAdjustX + scalingAdjustWidth/5, scalingAdjustY + 26*scalingFactor, cornerRounding)
            if (mousePressedButNotHeldDown()) {
                scalingFactorFetch -= 0.1
                scalingFactorFetch = max(scalingFactorFetch, 0.25)
                localStorage.setItem("scalingFactor", scalingFactorFetch)
                return
            }
        }
        // -1%
        if (mouseX > scalingAdjustX + scalingAdjustWidth/5 && mouseX < scalingAdjustX + 2*scalingAdjustWidth/5) {
            rect(scalingAdjustX + scalingAdjustWidth/5, scalingAdjustY + 13*scalingFactor, scalingAdjustX + 2*scalingAdjustWidth/5, scalingAdjustY + 26*scalingFactor, cornerRounding)
            if (mousePressedButNotHeldDown()) {
                scalingFactorFetch -= 0.01
                scalingFactorFetch = max(scalingFactorFetch, 0.25)
                localStorage.setItem("scalingFactor", scalingFactorFetch)
                return
            }
        }
        // +1%
        if (mouseX > scalingAdjustX + 3*scalingAdjustWidth/5 && mouseX < scalingAdjustX + 4*scalingAdjustWidth/5) {
            rect(scalingAdjustX + 3*scalingAdjustWidth/5, scalingAdjustY + 13*scalingFactor, scalingAdjustX + 4*scalingAdjustWidth/5, scalingAdjustY + 26*scalingFactor, cornerRounding)
            if (mousePressedButNotHeldDown()) {
                scalingFactorFetch += 0.01
                scalingFactorFetch = min(scalingFactorFetch, 10)
                localStorage.setItem("scalingFactor", scalingFactorFetch)
                return
            }
        }
        // +10%
        if (mouseX > scalingAdjustX + 4*scalingAdjustWidth/5 && mouseX < scalingAdjustX + scalingAdjustWidth) {
            rect(scalingAdjustX + 4*scalingAdjustWidth/5, scalingAdjustY + 13*scalingFactor, scalingAdjustX + scalingAdjustWidth, scalingAdjustY + 26*scalingFactor, cornerRounding)
            if (mousePressedButNotHeldDown()) {
                scalingFactorFetch += 0.1
                scalingFactorFetch = min(scalingFactorFetch, 10)
                localStorage.setItem("scalingFactor", scalingFactorFetch)
                return
            }
        }
    }
}

// since all the other things that display something on top of the separate
// sections are in functions, this should be in a function too for consistency
function displayDebugCorner() {
    textAlign(LEFT, BOTTOM)
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showBottom()
    textAlign(CENTER, CENTER)
}

//—————————————————————————————utility functions—————————————————————————————\\

function updateWins(winsPerCoinIncrease) {
    localStorage.setItem(currentlySelectedMechanic + " streak", parseInt(localStorage.getItem(currentlySelectedMechanic + " streak")) + 1)
    localStorage.setItem(currentlySelectedMechanic + " wins", parseInt(localStorage.getItem(currentlySelectedMechanic + " wins")) + 1)
    localStorage.setItem("coins", parseInt(ceil(parseFloat(localStorage.getItem(currentlySelectedMechanic + " streak")/numWinsPerCoinIncrease))) + parseInt(localStorage.getItem("coins")))
}

function updateLosses(winsPerCoinIncrease) {
    localStorage.setItem("coins", -parseInt(ceil(parseFloat(localStorage.getItem(currentlySelectedMechanic + " streak")/numWinsPerCoinIncrease + 1/numWinsPerCoinIncrease))) - 1 + parseInt(localStorage.getItem("coins")))
    localStorage.setItem("coins", max(parseInt(localStorage.getItem("coins")), 0))
    localStorage.setItem(currentlySelectedMechanic + " streak", 0)
    localStorage.setItem(currentlySelectedMechanic + " wipes", parseInt(localStorage.getItem(currentlySelectedMechanic + " wipes")) + 1)
}

function formatSeconds(s) {
    let seconds = floor(s) % 60
    let minutes = floor(s/60) % 60
    let hours = floor(s/3600)

    if (hours) return hours + ":" + addLeadingZero(minutes, 2) + ":" + addLeadingZero(seconds, 2)
    else if (minutes) return minutes + ":" + addLeadingZero(seconds, 2)
    else return seconds + "s"
}

function setMovementMode(mode) {
    realMT.mode = mode
    realOT.mode = mode
    realH1.mode = mode
    realH2.mode = mode
    realM1.mode = mode
    realM2.mode = mode
    realR1.mode = mode
    realR2.mode = mode
}

// adds leading zeros to "string" until it reaches targetLen (blunt-force
// strategy. wait, is it even called "blunt force"?)
function addLeadingZero(string, targetLen) {
    let s = string + ""
    while (s.length < targetLen) {
        s = "0" + s
    }
    return s
}

// in range of clicking something (circle radius)
function inClickingRange(position, range) {
    return (sqrt((mouseX - position[0])**2 +
        (mouseY - position[1])**2) < range)
}

// in range of clicking multiple things (circle radius)
function inClickingRanges(positions, range) {
    for (let position of positions) {
        if (inClickingRange(position, range)) return position
    }
    return false
}

// encapsulation function. makes code less messy
function translateToCenterOfBoard() {
    translate(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2);
}

// translates a position from 0,0 = center of board format to 0,0 = top-left
// of screen format
function translateXYPositionToBoardCenterFormat(position) {
    return [position[0] - centerOfBoard[0], position[1] - centerOfBoard[1]]
}

// translates a position from 0,0 = top-left of screen format to 0,0 =
// center of board format
function translateXYPositionToStandardFormat(position) {
    return [position[0] + centerOfBoard[0], position[1] + centerOfBoard[1]]
}

// translates a position from x,y to r,θ format
function translateXYPositionToRθFormat(position) {
    return [sqrt(position[0]**2 + position[1]**2), atan2(position[1], position[0])]
}

// translates a position from r,θ to x,y format
function translateRθPositionToXYFormat(position) {
    return [cos(position[1])*position[0], sin(position[1])*position[0]]
}

function mousePressedButNotHeldDown() {
    return mouseIsPressed && !mousePressedLastFrame
}

// update all the position vectors
function updateVectors() {
    realMT.targetX = MT[0]
    realMT.targetY = MT[1]
    realMT.update()
    realOT.targetX = OT[0]
    realOT.targetY = OT[1]
    realOT.update()
    realH1.targetX = H1[0]
    realH1.targetY = H1[1]
    realH1.update()
    realH2.targetX = H2[0]
    realH2.targetY = H2[1]
    realH2.update()
    realM1.targetX = M1[0]
    realM1.targetY = M1[1]
    realM1.update()
    realM2.targetX = M2[0]
    realM2.targetY = M2[1]
    realM2.update()
    realR1.targetX = R1[0]
    realR1.targetY = R1[1]
    realR1.update()
    realR2.targetX = R2[0]
    realR2.targetY = R2[1]
    realR2.update()
}

// when all the people are within threshold of their spot, this returns true
function belowPositioningThreshold(threshold, peopleToCheck) {
    for (let person of peopleToCheck) {
        if (sqrt((person[0][0] - person[1].x)**2 + (person[0][1] - person[1].y)**2) > threshold) return false
    }
    return true
}

// this is just useful. basically returns (x === y[0] || x === y[1] || x ===
// y[2]) and so on.
function checkEqualities(x, y) {
    for (let current of y) {
        if (x === current) return true
    }
}

// I'm sick and tired of trying to set someone's position but I only have a
// string containing their name
function setPosition(role, x, y) {
    switch (role) {
        case "MT":
            MT = [x, y]
            break
        case "OT":
            OT = [x, y]
            break
        case "M1":
            M1 = [x, y]
            break
        case "M2":
            M2 = [x, y]
            break
        case "H1":
            H1 = [x, y]
            break
        case "H2":
            H2 = [x, y]
            break
        case "R1":
            R1 = [x, y]
            break
        case "R2":
            R2 = [x, y]
            break
    }
}

// What if you want to set someone's position relative to their current
// position? That's right. Sometiimes. That's why this function exists.
function movePosition(role, x, y) {
    setPosition(role, currentPosition(role)[0] + x, currentPosition(role)[1] + y)
}

// Why not have a function to just set a certain amount of people to a
// certain place?
// warning: variance is the length of the range of people. an x of 20 with a
// variance of 10 will return 15-25, not 10-30
function setPositionsWithVariance(roles, x, y, xVariance, yVariance) {
    for (let role of roles) {
        setPosition(role, x + random(-xVariance/2, xVariance/2), y + random(-yVariance/2, yVariance/2))
    }
}

//—————————————————————————————display functions—————————————————————————————\\

// these puddles are always given in the format of [x, y, millisAppeared,
// radius]
function displayPuddle(puddleInfo) {
    push()
    translateToCenterOfBoard()
    let puddleX = puddleInfo[0]
    let puddleY = puddleInfo[1]
    let millisSinceAppeared = millis() - puddleInfo[2]
    let radius = puddleInfo[3]

    fill(0, 0, 80, 50)
    circle(puddleX, puddleY, map(millisSinceAppeared, 0, 500, 0, radius, true))
    pop()
}

// displayStarAoE but infinitely expanded
function displayExpandedStarAoE(x, y) {
    push()
    translateToCenterOfBoard()
    translate(x, y)
    fill(30, 100, 100, 60)
    stroke(0, 0, 100, 100)
    strokeWeight(1)
    rect(-mainBodyWidth/2, -10*scalingFactor, mainBodyWidth/2, 10*scalingFactor)
    rotate(PI/4)
    rect(-mainBodyWidth/2, -10*scalingFactor, mainBodyWidth/2, 10*scalingFactor)
    rotate(PI/4)
    rect(-mainBodyWidth/2, -10*scalingFactor, mainBodyWidth/2, 10*scalingFactor)
    rotate(PI/4)
    rect(-mainBodyWidth/2, -10*scalingFactor, mainBodyWidth/2, 10*scalingFactor)
    pop()
}

// displays a star AoE in the specified location. since it is conditional,
// it will never be done in a translation, so this has to translate itself.
function displayStarAoE(x, y) {
    push()
    translateToCenterOfBoard()
    translate(x, y)
    fill(30, 100, 100, 4)
    stroke(0, 0, 100, 100)
    strokeWeight(1)
    rect(-30*scalingFactor, -10*scalingFactor, 30*scalingFactor, 10*scalingFactor)
    rotate(PI/4)
    rect(-30*scalingFactor, -10*scalingFactor, 30*scalingFactor, 10*scalingFactor)
    rotate(PI/4)
    rect(-30*scalingFactor, -10*scalingFactor, 30*scalingFactor, 10*scalingFactor)
    rotate(PI/4)
    rect(-30*scalingFactor, -10*scalingFactor, 30*scalingFactor, 10*scalingFactor)
    pop()
}

// target symbol is orange plus above player, and a semicircle connecting to
// the top of the arc.   ◡
//                       |
//                       +
function displayTargetSymbol(x, y) {
    stroke(30, 100, 70)
    strokeWeight(2*scalingFactor)
    noFill()
    line(x, y - 10*scalingFactor, x, y - 20*scalingFactor)
    line(x - 3*scalingFactor, y - 15*scalingFactor, x + 3*scalingFactor, y - 15*scalingFactor)
    arc(x, y - 24*scalingFactor, 8*scalingFactor, 8*scalingFactor, -PI/8, 9*PI/8)
}

// spread marker, display via gray background and then a bunch of 10-opacity
// different-stroke-weight circles to provide a gradient effect towards the middle
function displaySpreadMarker(x, y, d, h, s, b) {
    noFill()
    stroke(0, 0, b/2)
    strokeWeight(7.5*scalingFactor)
    circle(x, y, d)
    stroke(h, s, b, 10)
    strokeWeight(7*scalingFactor)
    circle(x, y, d)
    strokeWeight(6.5*scalingFactor)
    circle(x, y, d)
    strokeWeight(6*scalingFactor)
    circle(x, y, d)
    strokeWeight(5.5*scalingFactor)
    circle(x, y, d)
    strokeWeight(5*scalingFactor)
    circle(x, y, d)
    strokeWeight(4.5*scalingFactor)
    circle(x, y, d)
    strokeWeight(4*scalingFactor)
    circle(x, y, d)
    strokeWeight(3.5*scalingFactor)
    circle(x, y, d)
    strokeWeight(3*scalingFactor)
    circle(x, y, d)
    strokeWeight(2.5*scalingFactor)
    circle(x, y, d)
    strokeWeight(2*scalingFactor)
    circle(x, y, d)
    strokeWeight(1.5*scalingFactor)
    circle(x, y, d)

    if (frameCount*1.5 % d < 2*d/3) {
        stroke(h, s, b, 30)
        strokeWeight(3 * scalingFactor)
        circle(x, y, (frameCount*1.5 % d)*3/2)
    }
}

function displayShiva(position, type, messageBox, sizeOfTorso) {
    push()
    translateToCenterOfBoard()
    noFill()
    let x = position[0]
    let y = position[1]
    if (type === "clone") {
        stroke(0, 0, 80)
    } else {
        stroke(220, 50, 100)
    }

    strokeWeight(sizeOfTorso/2)
    // torso
    line(x, y - sizeOfTorso, x, y)

    strokeWeight(sizeOfTorso/4)
    // legs
    line(x - sizeOfTorso/3, y + sizeOfTorso, x - sizeOfTorso/8, y)
    line(x + sizeOfTorso/3, y + sizeOfTorso, x + sizeOfTorso/8, y)


    // head
    circle(x, y - sizeOfTorso*5/3, sizeOfTorso)

    // arms
    line(x - sizeOfTorso*2/3, y - sizeOfTorso*2/3, x, y - sizeOfTorso)
    line(x - sizeOfTorso/3, y - sizeOfTorso/3, x - sizeOfTorso*2/3, y - sizeOfTorso*2/3)
    line(x + sizeOfTorso*2/3, y - sizeOfTorso*2/3, x, y - sizeOfTorso)
    line(x + sizeOfTorso/3, y - sizeOfTorso/3, x + sizeOfTorso*2/3, y - sizeOfTorso*2/3)


    // message box
    strokeWeight(sizeOfTorso/5)
    if (messageBox) {
        fill(0, 0, 100)
        rect(x - textWidth("   " + messageBox)/2, y - sizeOfTorso*15/4, x + textWidth("   " + messageBox)/2, y - sizeOfTorso*5/2)

        noStroke()
        fill(0, 0, 0)
        textAlign(CENTER, CENTER)
        text(messageBox, x, y - sizeOfTorso*13/4)
        textAlign(LEFT, BOTTOM)
    }



    pop()
}

function displayFatebreaker(position, raisedArm) {
    push()
    translateToCenterOfBoard()
    noFill()
    let x = position[0]
    let y = position[1]
    let sizeOfTorso = 15*scalingFactor

    // now just display a person

    // legs
    strokeWeight(sizeOfTorso/4)
    line(x - sizeOfTorso/3, y + sizeOfTorso, x - sizeOfTorso/8, y)
    line(x + sizeOfTorso/3, y + sizeOfTorso, x + sizeOfTorso/8, y)

    // body
    strokeWeight(sizeOfTorso/2)
    line(x, y - sizeOfTorso, x, y)

    // arms
    strokeWeight(sizeOfTorso/5)
    line(x - sizeOfTorso*2/3, y - sizeOfTorso*5/6, x, y - sizeOfTorso)
    line(x - sizeOfTorso/3, y - sizeOfTorso/3, x - sizeOfTorso*2/3, y - sizeOfTorso*5/6)

    // for the right arm, it could be raised and carrying a sword
    if (raisedArm) {
        line(x, y - sizeOfTorso, x + sizeOfTorso/2, y - sizeOfTorso)
        line(x + sizeOfTorso/4, y - sizeOfTorso*19/16, x + sizeOfTorso/2, y - sizeOfTorso)

        // sword
        strokeWeight(sizeOfTorso/10)
        line(x, y - sizeOfTorso*6.5/3, x, y - sizeOfTorso*7/3)
        triangle(x - sizeOfTorso/6, y - sizeOfTorso*7/3, x + sizeOfTorso/6, y - sizeOfTorso*7/3, x, y - sizeOfTorso*10/3)
    } else {
        line(x + sizeOfTorso*2/3, y - sizeOfTorso*5/6, x, y - sizeOfTorso)
        line(x + sizeOfTorso/3, y - sizeOfTorso/3, x + sizeOfTorso*2/3, y - sizeOfTorso*5/6)
    }

    // head
    strokeWeight(sizeOfTorso/6)
    circle(x, y - sizeOfTorso*5/3, sizeOfTorso)

    pop()
}

// this green dot is basically displayGreenDot, but the size is tweakable
// use the other functions if you are lazy and do not want to specify a size
function displayCustomizableGreenDot(x, y, size) {
    push()
    translateToCenterOfBoard()
    stroke(120, 100, 100)

    // if you mouse over it, dim it
    if (sqrt((mouseX - x - (mainBodyX + mainBodyWidth/2))**2 +
        (mouseY - y - (mainBodyY + mainBodyHeight/2))**2) < size*1/2) {
        stroke(120, 100, 80)
    }
    noFill()
    strokeWeight(scalingFactor)
    circle(x, y, size)
    pop()
}

// display a green dot for where to go
function displayGreenDot(x, y) {
    push()
    translateToCenterOfBoard()
    stroke(120, 100, 100)

    // if you mouse over it, dim it
    if (sqrt((mouseX - x - (mainBodyX + mainBodyWidth/2))**2 +
        (mouseY - y - (mainBodyY + mainBodyHeight/2))**2) < 10*scalingFactor) {
        stroke(120, 100, 80)
    }
    noFill()
    strokeWeight(scalingFactor)
    circle(x, y, 15*scalingFactor)
    pop()
}

// displays- a smaller green dot if you're in a tight spot
function displaySmallGreenDot(x, y) {
    push()
    translateToCenterOfBoard()
    stroke(120, 100, 100)

    // if you mouse over it, dim it
    if (sqrt((mouseX - x - (mainBodyX + mainBodyWidth/2))**2 +
        (mouseY - y - (mainBodyY + mainBodyHeight/2))**2) < 5*scalingFactor) {
        stroke(120, 100, 80)
    }
    noFill()
    strokeWeight(scalingFactor)
    circle(x, y, 10*scalingFactor)
    pop()
}

function displayCharacterPositions() {
    fill(220, 70, 80)
    noStroke()
    let size = 16*scalingFactor
    circle(realMT.x, realMT.y, size)
    circle(realOT.x, realOT.y, size)
    fill(120, 70, 80)
    circle(realH1.x, realH1.y, size)
    circle(realH2.x, realH2.y, size)
    fill(0, 70, 80)
    circle(realM1.x, realM1.y, size)
    circle(realM2.x, realM2.y, size)
    circle(realR1.x, realR1.y, size)
    circle(realR2.x, realR2.y, size)

    // display your role
    fill(50, 100, 60)
    stroke(0, 0, 100)
    strokeWeight(scalingFactor*1.5)
    switch (role) {
        case "MT":
            circle(realMT.x, realMT.y, size)
            break
        case "OT":
            circle(realOT.x, realOT.y, size)
            break
        case "H1":
            circle(realH1.x, realH1.y, size)
            break
        case "H2":
            circle(realH2.x, realH2.y, size)
            break
        case "M1":
            circle(realM1.x, realM1.y, size)
            break
        case "M2":
            circle(realM2.x, realM2.y, size)
            break
        case "R1":
            circle(realR1.x, realR1.y, size)
            break
        case "R2":
            circle(realR2.x, realR2.y, size)
            break
    }

    fill(0, 0, 100)
    stroke(0, 0, 100)
    strokeWeight(size/30)
    textSize(size/2)
    textAlign(CENTER, CENTER)
    text("MT", realMT.x, realMT.y - scalingFactor)
    text("OT", realOT.x, realOT.y - scalingFactor)
    text("H1", realH1.x, realH1.y - scalingFactor)
    text("H2", realH2.x, realH2.y - scalingFactor)
    text("M1", realM1.x, realM1.y - scalingFactor)
    text("M2", realM2.x, realM2.y - scalingFactor)
    text("R1", realR1.x, realR1.y - scalingFactor)
    text("R2", realR2.x, realR2.y - scalingFactor)
}

// an image that is rotated. it's that simple
function displayRotatedImage(i, x, y, width=i.width, height=i.height, rotation) {
    push()
    translate(x + width/2, y + width/2)
    rotate(rotation)
    image(i, -width/2, -height/2, width, height)
    pop()
}

//———————————————————————————————find your role———————————————————————————————\\

function meleeOrRanged(role) {
    if (role === "MT" || role === "OT" || role === "M1" || role === "M2") {return "melee"}
    return "ranged"
} // melee/ranged

function DPSOrSupports(role) {
    if (role === "MT" || role === "OT" || role === "H1" || role === "H2") {return "supports"}
    return "DPS"
} // DPS/supports

function DPSOrSupport(role) {
    if (role === "MT" || role === "OT" || role === "H1" || role === "H2") {return "support"}
    return "DPS"
} // DPS/support

function lightParty() {
    if (role === "MT" || role === "R1" || role === "H1" || role === "M1") {return 1}
    return 2
} // 1/2

// because it's super annoying when you have to write a switch statement
function yourPosition() {
    return currentPosition(role)
}

function currentPosition(role) {
    switch (role) {
        case "MT":
            return MT
        case "OT":
            return OT
        case "M1":
            return M1
        case "M2":
            return M2
        case "R1":
            return R1
        case "R2":
            return R2
        case "H1":
            return H1
        case "H2":
            return H2
    }
}

//——————————————————————————setup mechanic functions——————————————————————————\\

function reset() {
    // switch (currentlySelectedMechanic) {
    //     case "Utopian Sky":
    //         setupUtopianSky()
    //         break
    //     case "Diamond Dust":
    //         setupDiamondDust()
    //         break
    //     case "Mirror Mirror":
    //         setupMirrorMirror()
    //         break
    //     case "Millennial Decay":
    //         setupMillennialDecay()
    //         break
    //     case "Wingmark":
    //         setupWingmark()
    //         break
    // }


    // ChatGPT generated response—now I don't have to update "reset" every time
    let setupFunctionName = "setup" + currentlySelectedMechanic.replace(/\s/g, '');
    let setupFunction = window[setupFunctionName];

    if (typeof setupFunction === "function") {
        setupFunction();
    } else {
        console.warn(`No setup function found for: ${currentlySelectedMechanic}`);
    }
}

function setupUtopianSky() {
    erase()
    rect(0, 0, width, height)
    noErase()

    setMovementMode(defaultMovementMode)

    mechanicStarted = millis()

    fruP1Image = loadImage('data/FRU P1/Floor.png')
    utopianSkyFog = loadImage('data/FRU P1/Utopian Sky fogGrain2.jpg')

    stage = 0
    currentlySelectedMechanic = "Utopian Sky"
    currentlySelectedBackground = "FRU P1"

    numWinsPerCoinIncrease = 4

    MT = [0, -50*scalingFactor]
    OT = [50*scalingFactor, 0]
    H1 = [-50*scalingFactor, 0]
    H2 = [0, 50*scalingFactor]
    M1 = [-35*scalingFactor, 35*scalingFactor]
    M2 = [35*scalingFactor, 35*scalingFactor]
    R1 = [-35*scalingFactor, -35*scalingFactor]
    R2 = [35*scalingFactor, -35*scalingFactor]

    // now we'll have to set up which clones are unsafe
    unsafeClones = []
    // that'll start with which direction is safe, represented by which
    // people will stay at the edge
    safeDirections = random(["MT H2", "OT M1", "R2 H1", "M2 R1"])
    // then, from each unsafe direction, choose which side (or, rather,
    // which person) has the unsafe clone
    if (safeDirections === "MT H2") {
        unsafeClones = [random(["OT", "M1"]), random(["R2", "H1"]), random(["M2", "R1"])]
    } if (safeDirections === "OT M1") {
        unsafeClones = [random(["MT", "H2"]), random(["R2", "H1"]), random(["M2", "R1"])]
    } if (safeDirections === "R2 H1") {
        unsafeClones = [random(["MT", "H2"]), random(["OT", "M1"]), random(["M2", "R1"])]
    } if (safeDirections === "M2 R1") {
        unsafeClones = [random(["MT", "H2"]), random(["OT", "M1"]), random(["R2", "H1"])]
    }

    spreadOrStack = random(["spread", "stack"])

    // make the background.
    let css = select("html")
    css.style("background-image", "url(\"data/FRU P1/BG.png\")")
    css = select("body")
    css.style("background-image", "url(\"data/FRU P1/BG.png\")")

    textAtTop = "How fast can you really execute Utopian Sky? Because it's" +
        " time to test just that.\nAlso, please do remember that it's " + spreadOrStack +
        "s first.\n\nThe way the simulation works can be a bit confusing." +
        " You'll get the hang of it eventually.\nReady? Click on the green" +
        " dot in the center."
    textAtBottom = "You went to your default starting spot for this" +
        " simulation. \n[PASS] — You got to this page."

    instructions.html(`<pre>
numpad 1 → freeze sketch

Click on one of the buttons at the top to do what it says.
    Purge Data will purge the win/loss data for this mechanic and only the currently
     selected mechanic.
        Warning: not implemented.
        
You are currently on the mechanic Utopian Sky.
Click on any green dot to move to that location. Clicking on the green
 dot in the center at the start will automatically move you to your clock spot.
There isn't a timing feature on this mechanic——yet, that is. There will be soon.
You cannot track wins and losses yet. Once there is a system, wins and losses 
 from separate mechanics will be saved to local storage but counted separately.
This is a quiz, so make sure you've studied.

${updates}
</pre>`)
}

function setupDiamondDust() {
    erase()
    rect(0, 0, width, height)
    noErase()

    setMovementMode(defaultMovementMode)

    mechanicStarted = millis()

    fruP2Image = loadImage('data/FRU P2/Floor.webp')
    fruP2IceFloor = loadImage('data/FRU P2/Ice Floor (generated by ChatGPT DALL-E) 2.png')

    inOrOut = random(["in", "out"])
    markedPlayers = random(["supports", "DPS"])
    silenceOrStillness = random(["silence", "stillness"])
    spawnAngle = random([0, 45, 90, 135, 180, 225, 270, 315])
    puddles = []

    MT = [0, -70*scalingFactor]
    OT = [70*scalingFactor, 0]
    H1 = [-70*scalingFactor, 0]
    H2 = [0, 70*scalingFactor]
    M1 = [-49*scalingFactor, 49*scalingFactor]
    M2 = [49*scalingFactor, 49*scalingFactor]
    R1 = [-49*scalingFactor, -49*scalingFactor]
    R2 = [49*scalingFactor, -49*scalingFactor]

    stage = 0
    currentlySelectedMechanic = "Diamond Dust"
    currentlySelectedBackground = "FRU P2"

    numWinsPerCoinIncrease = 2

    let randomNumber = random()
    let radius = mainBodyWidth/6
    if (randomNumber < 0.25) {
        firstCircles = [[-sqrt(2)*radius, -sqrt(2)*radius], [sqrt(2)*radius, sqrt(2)*radius]]
        if (randomNumber < 0.125) {
            secondCircles = [[-2*radius, 0], [2*radius, 0]]
            thirdCircles = [[-sqrt(2)*radius, sqrt(2)*radius], [sqrt(2)*radius, -sqrt(2)*radius]]
            fourthCircles = [[0, -2*radius], [0, 2*radius]]
        } else {
            secondCircles = [[0, -2*radius], [0, 2*radius]]
            thirdCircles = [[-sqrt(2)*radius, sqrt(2)*radius], [sqrt(2)*radius, -sqrt(2)*radius]]
            fourthCircles = [[-2*radius, 0], [2*radius, 0]]
        }
    } if (randomNumber >= 0.25 && randomNumber < 0.5) {
        firstCircles = [[-2*radius, 0], [2*radius, 0]]
        if (randomNumber < 0.375) {
            secondCircles = [[-sqrt(2)*radius, sqrt(2)*radius], [sqrt(2)*radius, -sqrt(2)*radius]]
            thirdCircles = [[0, -2*radius], [0, 2*radius]]
            fourthCircles = [[-sqrt(2)*radius, -sqrt(2)*radius], [sqrt(2)*radius, sqrt(2)*radius]]
        } else {
            secondCircles = [[-sqrt(2)*radius, -sqrt(2)*radius], [sqrt(2)*radius, sqrt(2)*radius]]
            thirdCircles = [[0, -2*radius], [0, 2*radius]]
            fourthCircles = [[-sqrt(2)*radius, sqrt(2)*radius], [sqrt(2)*radius, -sqrt(2)*radius]]
        }
    } if (randomNumber >= 0.5 && randomNumber < 0.75) {
        firstCircles = [[-sqrt(2)*radius, sqrt(2)*radius], [sqrt(2)*radius, -sqrt(2)*radius]]
        if (randomNumber < 0.625) {
            secondCircles = [[0, -2*radius], [0, 2*radius]]
            thirdCircles = [[-sqrt(2)*radius, -sqrt(2)*radius], [sqrt(2)*mainBodyWidth/5, sqrt(2)*mainBodyWidth/5]]
            fourthCircles = [[-2*radius, 0], [2*radius, 0]]
        } else {
            secondCircles = [[-2*radius, 0], [2*radius, 0]]
            thirdCircles = [[-sqrt(2)*radius, -sqrt(2)*radius], [sqrt(2)*radius, sqrt(2)*radius]]
            fourthCircles = [[0, -2*radius], [0, 2*radius]]
        }
    } if (randomNumber >= 0.75) {
        firstCircles = [[0, -2*radius], [0, 2*radius]]
        if (randomNumber < 0.875) {
            secondCircles = [[-sqrt(2)*radius, -sqrt(2)*radius], [sqrt(2)*radius, sqrt(2)*radius]]
            thirdCircles = [[-2*radius, 0], [2*radius, 0]]
            fourthCircles = [[-sqrt(2)*radius, sqrt(2)*radius], [sqrt(2)*radius, -sqrt(2)*radius]]
        } else {
            secondCircles = [[-sqrt(2)*radius, sqrt(2)*radius], [sqrt(2)*radius, -sqrt(2)*radius]]
            thirdCircles = [[-2*radius, 0], [2*radius, 0]]
            fourthCircles = [[-sqrt(2)*radius, -sqrt(2)*radius], [sqrt(2)*radius, sqrt(2)*radius]]
        }
    }

    let css = select("html")
    css.style("background-image", "url(\"data/FRU P2/Floor.webp\")")
    css = select("body")
    css.style("background-image", "url(\"data/FRU P2/Floor.webp\")")

    textAtTop = "It's time for the first mechanic of P2—Diamond Dust. Do you" +
        " actually understand the mechanic or not?\n\n(CupNoodles has" +
        " implemented Fall of Faith already, and you can easily simulate" +
        " Burnt Strike towers.)"
    textAtBottom = "You went to your default starting spot for this" +
        " simulation. \n[PASS] — You got to this page."

    instructions.html(`<pre>
numpad 1 → freeze sketch
        
Click on one of the buttons at the top to do what it says.
    Purge Data will purge the win/loss data for this mechanic and only the currently
     selected mechanic.
        Warning: not implemented.
        
You are currently on the mechanic Diamond Dust.
Click on any green dot to move to that location. Clicking on the green
 dot in the center at the start will automatically move you to your clock spot.
There isn't a timing feature on this mechanic——yet, that is. There will be soon.
You cannot track wins and losses yet. Once there is a system, wins and losses 
 from separate mechanics will be saved to local storage but counted separately.
This is a quiz, so make sure you've studied.

${updates}
</pre>`)
}

function setupMirrorMirror() {
    erase()
    rect(0, 0, width, height)
    noErase()

    setMovementMode(defaultMovementMode)

    mechanicStarted = millis()

    blueMirrorAngle = random([0, 45, 90, 135, 180, 225, 270, 315])

    fruP2Image = loadImage('data/FRU P2/Floor.webp')
    mirror = loadImage('data/FRU P2/Mirror Mirror Mirror.png')
    redMirror = loadImage('data/FRU P2/Mirror Mirror Red Mirror.png')

    // red mirror configurations:
    // 1. red mirrors spawn around blue mirror
    // 2. red mirrors spawn 45º and 135º counterclockwise of blue mirror
    // 3. red mirrors spawn 90º and 180º counterclockwise of blue mirror
    // 4. red mirrors spawn opposite blue mirror
    // 5. red mirrors spawn 90º and 180º clockwise of blue mirror
    // 6. red mirrors spawn 45º and 135º clockwise of blue mirror
    redMirrorConfig = random([1, 2, 6])
    redMirrorAngleOne = blueMirrorAngle
    redMirrorAngleTwo = blueMirrorAngle
    rangedRedMirror = 1
    if (redMirrorConfig === 1) {
        redMirrorAngleOne -= 45
        redMirrorAngleTwo += 45
    } if (redMirrorConfig === 2) {
        redMirrorAngleOne -= 135
        redMirrorAngleTwo -= 45
    } if (redMirrorConfig === 3) {
        redMirrorAngleOne -= 180
        redMirrorAngleTwo -= 90
    } if (redMirrorConfig === 4) {
        redMirrorAngleOne += 135
        redMirrorAngleTwo -= 135
    } if (redMirrorConfig === 5) {
        redMirrorAngleOne += 90
        redMirrorAngleTwo += 180
    } if (redMirrorConfig === 6) {
        redMirrorAngleOne += 45
        redMirrorAngleTwo += 135
    }

    redMirrorAngleOne += 360
    redMirrorAngleOne %= 360
    redMirrorAngleTwo += 360
    redMirrorAngleTwo %= 360

    MT = [0, -70*scalingFactor]
    OT = [70*scalingFactor, 0]
    H1 = [-70*scalingFactor, 0]
    H2 = [0, 70*scalingFactor]
    M1 = [-49*scalingFactor, 49*scalingFactor]
    M2 = [49*scalingFactor, 49*scalingFactor]
    R1 = [-49*scalingFactor, -49*scalingFactor]
    R2 = [49*scalingFactor, -49*scalingFactor]

    stage = 0
    currentlySelectedMechanic = "Mirror Mirror"
    currentlySelectedBackground = "FRU P2"

    numWinsPerCoinIncrease = 3

    let css = select("html")
    css.style("background-image", "url(\"data/FRU P2/Floor.webp\")")
    css = select("body")
    css.style("background-image", "url(\"data/FRU P2/Floor.webp\")")

    textAtTop = "You just finished Diamond Dust—but you have no idea where" +
        " to go for the next mechanic, Mirror Mirror! \nOr maybe you do have" +
        " an idea. Whether you do or don't, this simulator should help you" +
        " reinforce your \nunderstanding.\n\nPlease select which cardinal or" +
        " intercardinal you should go to."
    textAtBottom = "You went to your default starting spot for this" +
        " simulation. \n[PASS] — You got to this page."

    instructions.html(`<pre>
numpad 1 → freeze sketch
        
This mechanic uses NAUR strats: https://docs.google.com/presentation/d/1VqIifgNf8RzXIWb8EGGVdKvOtKk0HmhPcHIMpizYuig/edit#slide=id.g31ad41a9148_0_79

Click on one of the buttons at the top to do what it says.
    Purge Data will purge the win/loss data for this mechanic and only the currently
     selected mechanic.
        Warning: not implemented.
        
You are currently on the mechanic Diamond Dust.
Click on any green dot to move to—or near—that location.
There isn't a timing feature on this mechanic——yet, that is. There will be soon.
You cannot track wins and losses yet. Once there is a system, wins and losses 
 from separate mechanics will be saved to local storage but counted separately.
This is a quiz, so make sure you've studied.

${updates}
</pre>`)
}

function setupMillennialDecay() {
    erase()
    rect(0, 0, width, height)
    noErase()

    setMovementMode(defaultMovementMode)

    mechanicStarted = millis()

    framesWhenKnockbackStarted = -10000000
    gustImage = loadImage("data/M8S P1 Gust.png")
    m8sP1Image = loadImage("data/M8S P1 arena.png")
    m8sP1Background = loadImage("data/M8S P1 background.png")
    m8sP1WolfHead = loadImage("data/M8S P1 wolf head.png")
    m8sP1LineAoE = loadImage("data/M8S P1 line AoE.png")
    // dpsOrSupportsFirst = random(["DPS", "supports"])
    // wolfHeadRotation = random(["cw", "ccw"])
    dpsOrSupportsFirst = "supports"
    wolfHeadRotation = "ccw"
    actualWolfHeadRotation = (wolfHeadRotation === "ccw" ? "cw" : "ccw")
    northOrSouth = random(["N", "S"])

    numWinsPerCoinIncrease = -1

    // create a random spread with everyone north
    realMT.x = random(-50*scalingFactor, 50*scalingFactor)
    realMT.y = random(-120*scalingFactor, -60*scalingFactor)
    realOT.x = random(-50*scalingFactor, 50*scalingFactor)
    realOT.y = random(-120*scalingFactor, -60*scalingFactor)
    realH1.x = random(-50*scalingFactor, 50*scalingFactor)
    realH1.y = random(-120*scalingFactor, -60*scalingFactor)
    realH2.x = random(-50*scalingFactor, 50*scalingFactor)
    realH2.y = random(-120*scalingFactor, -60*scalingFactor)
    realM1.x = random(-50*scalingFactor, 50*scalingFactor)
    realM1.y = random(-120*scalingFactor, -60*scalingFactor)
    realM2.x = random(-50*scalingFactor, 50*scalingFactor)
    realM2.y = random(-120*scalingFactor, -60*scalingFactor)
    realR1.x = random(-50*scalingFactor, 50*scalingFactor)
    realR1.y = random(-120*scalingFactor, -60*scalingFactor)
    realR2.x = random(-50*scalingFactor, 50*scalingFactor)
    realR2.y = random(-120*scalingFactor, -60*scalingFactor)
    MT = [realMT.x*5/6 + random(-10*scalingFactor, 10*scalingFactor), realMT.y*5/6 + random(-10*scalingFactor, 10*scalingFactor)]
    OT = [realOT.x*5/6 + random(-10*scalingFactor, 10*scalingFactor), realOT.y*5/6 + random(-10*scalingFactor, 10*scalingFactor)]
    H1 = [realH1.x*5/6 + random(-10*scalingFactor, 10*scalingFactor), realH1.y*5/6 + random(-10*scalingFactor, 10*scalingFactor)]
    H2 = [realH2.x*5/6 + random(-10*scalingFactor, 10*scalingFactor), realH2.y*5/6 + random(-10*scalingFactor, 10*scalingFactor)]
    M1 = [realM1.x*5/6 + random(-10*scalingFactor, 10*scalingFactor), realM1.y*5/6 + random(-10*scalingFactor, 10*scalingFactor)]
    M2 = [realM2.x*5/6 + random(-10*scalingFactor, 10*scalingFactor), realM2.y*5/6 + random(-10*scalingFactor, 10*scalingFactor)]
    R1 = [realR1.x*5/6 + random(-10*scalingFactor, 10*scalingFactor), realR1.y*5/6 + random(-10*scalingFactor, 10*scalingFactor)]
    R2 = [realR2.x*5/6 + random(-10*scalingFactor, 10*scalingFactor), realR2.y*5/6 + random(-10*scalingFactor, 10*scalingFactor)]

    stage = 0
    currentlySelectedMechanic = "MillennialMillennial Decay"
    currentlySelectedBackground = "M8S P1"

    let css = select("html")
    css.style("background-image", "url(\"data/M8S P1 background.png\")")
    css = select("body")
    css.style("background-image", "url(\"data/M8S P1 background.png\")")

    textAtTop = "This simulator aims to help your adds, clock TR, beckon moonlight, P1 enrage, twofold tempest, lone \n" +
        "wolf's lament, champion's circuit, and P2 enrage prog parties, as well as your reclear groups, see adds \n" +
        "once. Most PF parties are decay prog parties in disguise. Please use the" +
        " Murderless Fering Decay video \nby Hector. Click on the dot in the" +
        " center to continue."
    textAtBottom = "You went to your default starting spot for this" +
        " simulation. \n[PASS] — You got to this page."

    instructions.html(`<pre>
numpad 1 → freeze sketch
        
This mechanic uses Murderless Fering Decay from Hector and <b>will</b> fail you for not following it completely.
    Here it is: <a href="https://www.youtube.com/watch?v=cZ6uAQToW3w">https://www.youtube.com/watch?v=cZ6uAQToW3w</a>

Click on one of the buttons at the top to do what it says.
    Purge Data will purge the win/loss data for this mechanic and only the currently
     selected mechanic.
        
You are currently on the mechanic Diamond Dust.
Click on any green dot to move to—or near—that location.
This is a quiz, so make sure you've studied.

${updates}
</pre>`)
}

function setupWingmark() {
    erase()
    rect(0, 0, width, height)
    noErase()

    setMovementMode(defaultMovementMode)

    mechanicStarted = millis()

    framesWhenKnockbackStarted = -10000000
    m6sP1Image = loadImage("data/M6S arena normal.webp")
    m6sP1Bomb = loadImage("data/M6S bomb.png")
    m6sP1WingedBomb = loadImage("data/M6S winged bomb.png")
    m6sP1Morbol = loadImage("data/M6S morbol.png")
    m6sP1Succubus = loadImage("data/M6S succubus.png")
    m6sBoss = loadImage("data/M6S boss")
    // dpsOrSupportsFirst = random(["DPS", "supports"])
    // wolfHeadRotation = random(["cw", "ccw"])
    dpsOrSupportsFirst = "supports"
    wolfHeadRotation = "ccw"
    actualWolfHeadRotation = (wolfHeadRotation === "ccw" ? "cw" : "ccw")
    northOrSouth = random(["N", "S"])

    // the m6SP1Image is too high quality! reduce it to half its size.

    numWinsPerCoinIncrease = -1

    // create a random spread with everyone south and MT north
    realMT.x = 0
    realMT.y = random(-70*scalingFactor, -65*scalingFactor)
    realOT.x = random(-50*scalingFactor, 50*scalingFactor)
    realOT.y = random(90*scalingFactor, 40*scalingFactor)
    realH1.x = random(-50*scalingFactor, 50*scalingFactor)
    realH1.y = random(90*scalingFactor, 40*scalingFactor)
    realH2.x = random(-50*scalingFactor, 50*scalingFactor)
    realH2.y = random(90*scalingFactor, 40*scalingFactor)
    realM1.x = random(-50*scalingFactor, 50*scalingFactor)
    realM1.y = random(90*scalingFactor, 40*scalingFactor)
    realM2.x = random(-50*scalingFactor, 50*scalingFactor)
    realM2.y = random(90*scalingFactor, 40*scalingFactor)
    realR1.x = random(-50*scalingFactor, 50*scalingFactor)
    realR1.y = random(90*scalingFactor, 40*scalingFactor)
    realR2.x = random(-50*scalingFactor, 50*scalingFactor)
    realR2.y = random(90*scalingFactor, 40*scalingFactor)
    MT = [realMT.x, realMT.y]
    OT = [realOT.x, realOT.y]
    H1 = [realH1.x, realH1.y]
    H2 = [realH2.x, realH2.y]
    M1 = [realM1.x, realM1.y]
    M2 = [realM2.x, realM2.y]
    R1 = [realR1.x, realR1.y]
    R2 = [realR2.x, realR2.y]

    stage = 0
    currentlySelectedMechanic = "Wingmark"
    currentlySelectedBackground = "M6S Start & Adds"

    let css = select("html")
    css.style("background-image", "url(\"data/M6S arena normal.webp\")")
    css = select("body")
    css.style("background-image", "url(\"data/M6S arena normal.webp\")")

    textAtTop = "Wingmark is hard because it's complex, and Wingmark is" +
        " complex because people are incompetent.\nThis simulation aims to" +
        " help you not be incompetent like everyone else in PF.\n\nSmall" +
        " tip: Try to get close to bombs and succubus and away from morbols" +
        " and winged bombs—that is \nwhere you're supposed to go to. Just" +
        " don't die on your normals because of that."
    textAtBottom = "You went to your default starting spot for this" +
        " simulation. \n[PASS] — You got to this page."

    instructions.html(`<pre>
numpad 1 → freeze sketch
        
This mechanic uses Murderless Fering Decay from Hector and <b>will</b> fail you for not following it completely.
    Here it is: <a href="https://www.youtube.com/watch?v=cZ6uAQToW3w">https://www.youtube.com/watch?v=cZ6uAQToW3w</a>

Click on one of the buttons at the top to do what it says.
    Purge Data will purge the win/loss data for this mechanic and only the currently
     selected mechanic.
        
You are currently on the mechanic Diamond Dust.
Click on any green dot to move to—or near—that location.
This is a quiz, so make sure you've studied.

${updates}
</pre>`)
}


//———————————————————————————————glow functions———————————————————————————————\\

function glowRect(h, s, b, a, weight, param1, param2, param3, param4, param5 = 0, param6 = 0, param7 = 0, param8 = 0) {
    strokeWeight(weight)
    stroke(h, s, b, a)
    rect(param1, param2, param3, param4, param5, param6, param7, param8)

    strokeWeight(weight*9/10)
    stroke(h, s*1.5/3, b*1.5/3 + 100/2, a/2)
    rect(param1, param2, param3, param4, param5, param6, param7, param8)

    strokeWeight(weight*4/5)
    stroke(h, s*1.5/3, b*1.5/3 + 100/2, a)
    rect(param1, param2, param3, param4, param5, param6, param7, param8)

    strokeWeight(weight*7/10)
    stroke(h, s*1/4, b*1/4 + 300/4, a/2)
    rect(param1, param2, param3, param4, param5, param6, param7, param8)

    strokeWeight(weight*3/5)
    stroke(h, s*1/4, b*1/4 + 300/4, a)
    rect(param1, param2, param3, param4, param5, param6, param7, param8)

    strokeWeight(weight*1/2)
    stroke(h, 0, 100, a/2)
    rect(param1, param2, param3, param4, param5, param6, param7, param8)

    strokeWeight(weight*2/5)
    stroke(h, 0, 100, a)
    rect(param1, param2, param3, param4, param5, param6, param7, param8)
}

function glowCircle(h, s, b, a, weight, param1, param2, param3) {
    strokeWeight(weight)
    stroke(h, s, b, a)
    circle(param1, param2, param3)

    strokeWeight(weight*9/10)
    stroke(h, s*1.5/3, b*1.5/3 + 100/2, a/2)
    circle(param1, param2, param3)

    strokeWeight(weight*4/5)
    stroke(h, s*1.5/3, b*1.5/3 + 100/2, a)
    circle(param1, param2, param3)

    strokeWeight(weight*7/10)
    stroke(h, s*1/4, b*1/4 + 300/4, a/2)
    circle(param1, param2, param3)

    strokeWeight(weight*3/5)
    stroke(h, s*1/4, b*1/4 + 300/4, a)
    circle(param1, param2, param3)

    strokeWeight(weight*1/2)
    stroke(h, 0, 100, a/2)
    circle(param1, param2, param3)

    strokeWeight(weight*2/5)
    stroke(h, 0, 100, a)
    circle(param1, param2, param3)
}

function glowPoint(h, s, b, a, weight, param1, param2) {
    strokeWeight(weight)
    stroke(h, s, b, a)
    point(param1, param2)

    strokeWeight(weight*9/10)
    stroke(h, s*1.5/3, b*1.5/3 + 100/2, a/2)
    point(param1, param2)

    strokeWeight(weight*4/5)
    stroke(h, s*1.5/3, b*1.5/3 + 100/2, a)
    point(param1, param2)

    strokeWeight(weight*7/10)
    stroke(h, s*1/4, b*1/4 + 300/4, a/2)
    point(param1, param2)

    strokeWeight(weight*3/5)
    stroke(h, s*1/4, b*1/4 + 300/4, a)
    point(param1, param2)

    strokeWeight(weight*1/2)
    stroke(h, 0, 100, a/2)
    point(param1, param2)

    strokeWeight(weight*2/5)
    stroke(h, 0, 100, a)
    point(param1, param2)
}

function glowText(h, s, b, a, weight, param1, param2, param3) {
    strokeWeight(weight)
    stroke(h, s, b, a)
    fill(h, s, b, a)
    text(param1, param2, param3)

    strokeWeight(weight*9/10)
    stroke(h, s*1.5/3, b*1.5/3 + 100/2, a/2)
    fill(h, s*1.5/3, b*1.5/3 + 100/2, a/2)
    text(param1, param2, param3)

    strokeWeight(weight*4/5)
    stroke(h, s*1.5/3, b*1.5/3 + 100/2, a)
    fill(h, s*1.5/3, b*1.5/3 + 100/2, a)
    text(param1, param2, param3)

    strokeWeight(weight*7/10)
    stroke(h, s*1/4, b*1/4 + 300/4, a/2)
    fill(h, s*1/4, b*1/4 + 300/4, a/2)
    text(param1, param2, param3)

    strokeWeight(weight*3/5)
    stroke(h, s*1/4, b*1/4 + 300/4, a)
    fill(h, s*1/4, b*1/4 + 300/4, a)
    text(param1, param2, param3)

    strokeWeight(weight*1/2)
    stroke(h, 0, 100, a/2)
    fill(h, 0, 100, a/2)
    text(param1, param2, param3)

    strokeWeight(weight*2/5)
    stroke(h, 0, 100, a)
    fill(h, 0, 100, a)
    text(param1, param2, param3)
}

function glowWaymark(h, s, b, a, rectOrCircle, weight, x, y, width, text) {
    noFill()
    if (rectOrCircle === "rect") {
        glowRect(h, s, b, a, weight, x - width/2, y - width/2, x + width/2, y + width/2)
    }
    if (rectOrCircle === "circle") {
        glowCircle(h, s, b, a, weight, x, y, width)
    }
    textAlign(CENTER, CENTER)
    textSize(2*width/3)
    glowText(h, s, b, a, weight/2, text, x, y - width/8)
}

//—————————————————————————————————miscellany—————————————————————————————————\\
function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
    }

    if (key === '`') { /* toggle debug corner visibility */
        debugCorner.visible = !debugCorner.visible
        console.log(`debugCorner visibility set to ${debugCorner.visible}`)
    }
}