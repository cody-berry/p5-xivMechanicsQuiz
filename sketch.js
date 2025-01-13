/**
 *  @author Cody
 *  @date 2025.01.06
 *  earliest mechanic: Utopian Sky from FRU P1
 *  latest mechanic: Diamond Dust from FRU P2 (in-progress)
 *  Some encapsulations might not be included in certain places, making the code
 *   messier than it can be.
 */

// arriving 2D variable
class ArrivingVector {
    constructor(x, y, targetX, targetY, speed, slowdown) {
        this.x = x;
        this.y = y;
        this.targetX = targetX
        this.targetY = targetY
        this.speed = speed
        this.slowdown = slowdown
    }

    // update x and y.
    update() {
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
    }
}

// initial variables from template
let font
let fixedWidthFont
let variableWidthFont
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */

// displaying the windows
let scalingFactor = 1.33
let scalingFactorFetch = localStorage.getItem("scalingFactor")
if (!scalingFactorFetch) {
    localStorage.setItem("scalingFactor", "1.33")
    scalingFactorFetch = "1.33"
}
scalingFactor = parseFloat(scalingFactorFetch)
scalingFactorFetch = parseFloat(scalingFactorFetch)

let textPadding = 3.5*scalingFactor
let topSquareSize = 50*scalingFactor // the size of the top corner squares
let topWidth = 250*scalingFactor  // the width of the window at the top, not including the top corner squares
let mechanicSelectionRows = 7 // the number of rows in "mechanic selection"
let mechanicSelectionHeight = mechanicSelectionRows*13*scalingFactor + textPadding*2
let middleTopHeight = 50*scalingFactor // the height of the window just above the main body
let bottomHeight = 50*scalingFactor // the height of the window at the bottom
let holeSize = 10*scalingFactor
let cornerRounding = 10*scalingFactor
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
let updates = `<strong>Updates</strong>:                                        🌴
    +<strong>First half of Diamond Dust</strong>                  | |-🌿
    +Scaling factor adjust window   🍃       🌿-| |
    +Smoother character position changes     🌿-| |
    +<strong>FRU P2 background & Diamond Dust setup</strong>      |/
    +Background image through CSS            🌿-|       🍃
    +Customization through code              🌿-|
    +Resizing through code          🍃       🌿-|
    +<strong>Utopian Sky</strong>                         🍂🍂   |  🌴
    <strong>Initialization</strong>                      ————————————————`

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
let firstCircles
let secondCircles
let thirdCircles
let fourthCircles
let markedPlayers
let silenceOrStillness
let inOrOut
let ice

// other variables
let currentlySelectedMechanic = "Utopian Sky"
let currentlySelectedBackground = "FRU P1"
let stage = 0 // the current step you're on. always defaults to 0
let mechanicStarted = 0
let textAtTop
let textAtBottom
let centerOfBoard

function preload() {
    font = loadFont('data/meiryo.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')
    fruP1Image = loadImage('data/FRU P1 Floor.png')
    utopianSkyFog = loadImage('data/fogGrain2.jpg')
    fruP2Image = loadImage('data/FRU P2 Floor.webp')
    ice = loadImage('data/Ice.jpg')
}


function setup() {
    let bonusWidth = 200*scalingFactor
    let cnv = createCanvas(topSquareSize*2 + holeSize*4 + topWidth + bonusWidth,
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
}

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

function draw() {
    frameRate(60)

    updateVectors()

    // the green square at the top-left TODO
    fill(120, 80, 50)
    noStroke()
    rect(greenSquareX, greenSquareY, greenSquareX + topSquareSize, greenSquareY + topSquareSize, cornerRounding)

    // the top window
    fill(234, 34, 24)
    noStroke()
    rect(topWindowX, topWindowY, topWindowX + topWidth, topWindowY + topSquareSize, cornerRounding)
    displayTopWindowContent()

    // the red square at the top-right TODO
    fill(350, 80, 50)
    noStroke()
    rect(redSquareX, redSquareY, redSquareX + topSquareSize, redSquareY + topSquareSize, cornerRounding)

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

function displayMechanicSelection() {
    fill(0, 0, 100)
    noStroke()
    textAlign(LEFT, TOP)
    textSize(10*scalingFactor)
    text("FRU: Utopian Sky | Diamond Dust | |\n" +
        "\n" +
        "Who knows, maybe there'll be other mechanics soon.",
        selectionX + textPadding, selectionY + textPadding)

    fill(0, 0, 0, 30)
    if (mouseX > selectionX + textPadding && mouseX < selectionX + selectionWidth - textPadding) {
        // row 1
        if (mouseY > selectionY + textPadding && mouseY < selectionY + 13*scalingFactor + textPadding) {
            if (mouseX > selectionX + textPadding + textWidth("FRU:") &&
                mouseX < selectionX + textPadding + textWidth("FRU: Utopian Sky ")) {
                rect(selectionX + textPadding + textWidth("FRU:"), selectionY + textPadding,
                     selectionX + textPadding + textWidth("FRU: Utopian Sky "), selectionY + 13*scalingFactor + textPadding)
                if (mousePressedButNotHeldDown()) {
                    setupUtopianSky()
                }
            } if (mouseX > selectionX + textPadding + textWidth("FRU: Utopian Sky |") &&
                mouseX < selectionX + textPadding + textWidth("FRU: Utopian Sky | Diamond Dust ")) {
                rect(selectionX + textPadding + textWidth("FRU: Utopian Sky |"), selectionY + textPadding,
                    selectionX + textPadding + textWidth("FRU: Utopian Sky | Diamond Dust "), selectionY + 13*scalingFactor + textPadding)
                if (mousePressedButNotHeldDown()) {
                    setupDiamondDust()
                }
            }
        }
        // row 2
        if (mouseY > selectionY + 13*scalingFactor + textPadding && mouseY < selectionY + 26*scalingFactor + textPadding) {
            // rect(0, selectionY + 13*scalingFactor + textPadding, width, selectionY + 26*scalingFactor + textPadding)
        }
        // row 3
        if (mouseY > selectionY + 26*scalingFactor + textPadding && mouseY < selectionY + 39*scalingFactor + textPadding) {
            // rect(0, selectionY + 26*scalingFactor + textPadding, width, selectionY + 39*scalingFactor + textPadding)
        }
        // row 4
        if (mouseY > selectionY + 39*scalingFactor + textPadding && mouseY < selectionY + 52*scalingFactor + textPadding) {
            // rect(0, selectionY + 39*scalingFactor + textPadding, width, selectionY + 52*scalingFactor + textPadding)
        }
    }


    textSize(7*scalingFactor)
}

function displayTopWindowContent() {
    textAlign(LEFT, BASELINE)
    noStroke()
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
}

function displayMainBodyContent() {
    push()
    translateToCenterOfBoard()
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
                print(oppositeRole)

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
                                " \n[PASS] It's spreads. [CLEARED]"
                            stage = 99
                        } else {
                            textAtTop = "You went to the wrong position. If" +
                                " you're having trouble, you might want to" +
                                " be a healer. They\ndon't have to worry" +
                                " about spread or stack. (joking)"
                            textAtBottom = "You went to your spread spot." +
                                " \n[FAIL] It's stacks."
                            stage = 100
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
                        } else {
                            textAtTop = "Congratulations! You made it" +
                                " through everything, although this is one" +
                                " of the easier mechanics \nto do when not" +
                                " timed."
                            textAtBottom = "You went to your stack spot." +
                                " \n[PASS] It's stacks. [CLEARED]"

                            if (role === "H1" || role === "H2") {
                                textAtTop += "\n\n\nHey, you're a healer." +
                                    " Stop cheating by not having to worry" +
                                    " about stack or spread."
                                textAtBottom = "You went to your" +
                                    " stack—I mean, spread—wait, there" +
                                    " isn't even a difference—spot." +
                                    " \n[PASS] You're a healer. [CLEARED]"
                            }

                            stage = 99
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
        print(stage)
        if (currentlySelectedMechanic === "Diamond Dust") {
            if (stage === 0) {
                displayGreenDot(0, 0)

                displayShiva([-20*scalingFactor, 0], "clone", null)
                displayShiva([20*scalingFactor, 0], "boss", null)

                if (inClickingRange(centerOfBoard, 10*scalingFactor) && mousePressedButNotHeldDown()) {
                    stage = 1
                    textAtTop = "The AoEs have just appeared. Go in or out" +
                        " according to the castbar and whether you got" +
                        " marked, and \nmake sure to go the correct" +
                        " direction. All directions are included for ease of" +
                        " implementation.\nThe green dots are made smaller" +
                        " so that you can't click on two.\n\nThis time, " + markedPlayers +
                        " have been targetted."
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
                    displayShiva([0, -mainBodyWidth/5], "clone", "Reap!")
                } if (inOrOut === "out") {
                    displayShiva([0, -mainBodyWidth/5], "clone", "Cleave!")
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

                // make sure we know if we got targetted. we'll have a
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
                            return
                        }
                        if (inClickingRanges(outerCirclePositions, 5 * scalingFactor)) {
                            textAtTop = "You didn't dodge the cleave properly." +
                                " The message box is located near the north of" +
                                " the arena for display \npurposes. "
                            textAtBottom = "You went out.\n[FAIL] — \"Reap\" is a donut."
                            stage = 100
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
                            return
                        }
                        if (inClickingRanges(outerDonutPositions, 5 * scalingFactor)) {
                            textAtTop = "You didn't dodge the cleave properly." +
                                " The message box is located near the north of" +
                                " the arena for display \npurposes. "
                            textAtBottom = "You went in.\n[FAIL] — \"Cleave\" is a circle."
                            stage = 100
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
                            return
                        }
                        if (inClickingRanges(outerDonutPositions, 5 * scalingFactor)) {
                            textAtTop = "You were supposed to bait a protean."
                            textAtBottom = "You went into your AoE dropping" +
                                " position.\n" + textAtBottom + "\n[FAIL] —" +
                                " You were not marked."
                            stage = 100
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
                            return
                        }
                        if (inClickingRanges(innerDonutPositions, 5 * scalingFactor)) {
                            textAtTop = "You were not supposed to bait a protean."
                            textAtBottom = "You went into your protean bait" +
                                " position.\n" + textAtBottom + "\n[FAIL] —" +
                                " You were marked."
                            stage = 100
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

                // make sure we know if we got targetted. we'll have a
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
                    if (markedPlayers !== DPSOrSupports()) {
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
                        } if (inClickingRange(outerRingPosition, 10 * scalingFactor)) {
                            textAtTop = "You went too far out. This is the" +
                                " position you would drop your star AoEs in" +
                                " if it were point-blank AoE."
                            textAtBottom = "You went too far out. \n" +
                                "[FAIL] — You are supposed go to the inner ring."
                            stage = 100
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
                    if (markedPlayers === DPSOrSupports()) {
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
                            if (markedPlayers === DPSOrSupports()) {
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
                                    " pre-position for the next mechanic."
                                stage = 100
                            }
                        } if (inClickingRange(outerRingPosition, 10*scalingFactor)) {
                            if (markedPlayers === DPSOrSupports()) {
                                // descriptions are different for each,
                                // though they result in the same outcome
                                textAtTop = "You ran in slightly too much." +
                                    " Though this will not necessarily cause" +
                                    " a wipe, this may cause the parts of\n" +
                                    "the star AoE running parellel to the" +
                                    " edge to clip other people."
                                textAtBottom = "[FAIL] — You ran in."
                                stage = 100
                            } else {
                                textAtTop = "You did not run in as an" +
                                    " unmarked player."
                                textAtBottom = "You stayed where you were. \n" +
                                    "[FAIL] — You did not run in.\n" +
                                    "\n" +
                                    "[NOTE] — It is technically okay to not" +
                                    " run in so long as the first AoE did" +
                                    " not spawn on you, but it is better \nto" +
                                    " pre-position for the knockback."
                                stage = 100
                            }
                        } if (inClickingRange(innerRingPosition, 10*scalingFactor)) {
                            if (markedPlayers === DPSOrSupports()) {
                                textAtTop = "You ran in too much, though" +
                                    " the only reason why we don't run in is" +
                                    " because it takes...more effort." +
                                    " \nThat's all, it wouldn't cause a" +
                                    " wipe, but it's better to avoid it."
                                textAtBottom = "[FAIL] — You ran in."
                                stage = 100
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
                        }
                    } else {
                        textAtTop = "You are supposed to go to one of the" +
                            " places where the first circle spawned."
                        textAtBottom = "You went to the wrong circle." +
                            " \n[FAIL] — You didn't go to one of the" +
                            " locations where the first circles spawned."
                        stage = 100

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
                    MT = [realMT.x*10 + random(0, 5)*scalingFactor, realMT.y*10 + random(0, 5)*scalingFactor]
                    OT = [realOT.x*10 + random(0, 5)*scalingFactor, realOT.y*10 - random(0, 5)*scalingFactor]
                    H1 = [realH1.x*10 - random(0, 5)*scalingFactor, realH1.y*10 + random(0, 5)*scalingFactor]
                    H2 = [realH2.x*10 - random(0, 5)*scalingFactor, realH2.y*10 - random(0, 5)*scalingFactor]
                    M1 = [realM1.x*10 + random(0, 5)*scalingFactor, realM1.y*10 + random(0, 5)*scalingFactor]
                    M2 = [realM2.x*10 + random(0, 5)*scalingFactor, realM2.y*10 - random(0, 5)*scalingFactor]
                    R1 = [realR1.x*10 - random(0, 5)*scalingFactor, realR1.y*10 + random(0, 5)*scalingFactor]
                    R2 = [realR2.x*10 - random(0, 5)*scalingFactor, realR2.y*10 - random(0, 5)*scalingFactor]

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
                        "you rotate to?"

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
                }
            } if (stage === 4) {
                // which way do you rotate?
            }
        }
    }
}

function lightParty() {
    if (role === "MT" || role === "R1" || role === "H1" || role === "M1") {return 1}
    return 2
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
// it will never be done in a translation.
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

function DPSOrSupports() {
    if (role === "MT" || role === "OT" || role === "H1" || role === "H2") {return "supports"}
    return "DPS"
}

function yourPosition() {
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

// target symbol is orange plus above player.
function displayTargetSymbol(x, y) {
    stroke(30, 100, 70)
    strokeWeight(2*scalingFactor)
    noFill()
    line(x, y - 10*scalingFactor, x, y - 20*scalingFactor)
    line(x - 3*scalingFactor, y - 15*scalingFactor, x + 3*scalingFactor, y - 15*scalingFactor)
    arc(x, y - 24*scalingFactor, 8*scalingFactor, 8*scalingFactor, -PI/8, 9*PI/8)
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

function mousePressedButNotHeldDown() {
    return mouseIsPressed && !mousePressedLastFrame
}

function displayShiva(position, type, messageBox) {
    push()
    translateToCenterOfBoard()
    noFill()
    let x = position[0]
    let y = position[1]
    let sizeOfTorso = 10*scalingFactor
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

// encapsulation function. makes code less messy
function translateToCenterOfBoard() {
    translate(mainBodyX + mainBodyWidth/2, mainBodyY + mainBodyHeight/2);
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
function displaySmallGreenDot (x, y) {
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

// since all the other things that display something on top of the separate
// sections are in functions, this should be in a function too for consistency
function displayDebugCorner() {
    textAlign(LEFT, BOTTOM)
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showBottom()
    textAlign(CENTER, CENTER)
}

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

//————————————below is a list of setup functions for each mechanic————————————\\

function reset() {
    switch (currentlySelectedMechanic) {
        case "Utopian Sky":
            setupUtopianSky()
            break
        case "Diamond Dust":
            setupDiamondDust()
            break
    }
}

function setupUtopianSky() {
    erase()
    rect(0, 0, width, height)
    noErase()

    mechanicStarted = frameCount

    stage = 0
    currentlySelectedMechanic = "Utopian Sky"
    currentlySelectedBackground = "FRU P1"

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
    css.style("background-image", "url(\"data/FRU P1 BG.png\")")
    css = select("body")
    css.style("background-image", "url(\"data/FRU P1 BG.png\")")

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

    mechanicStarted = frameCount

    inOrOut = random(["in", "out"])
    markedPlayers = random(["supports", "DPS"])
    silenceOrStillness = random(["silence", "stillness"])
    spawnAngle = random([0, 45, 90, 135, 180, 225, 270, 315])

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
    css.style("background-image", "url(\"data/FRU P2 Floor.webp\")")
    css = select("body")
    css.style("background-image", "url(\"data/FRU P2 Floor.webp\")")

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