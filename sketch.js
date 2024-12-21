/**
 *  @author
 *  @date 2024.
 *
 */

// initial variables from template
let font
let fixedWidthFont
let variableWidthFont
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */

// displaying the windows
let topSquareSize = 100 // the size of the top corner squares
let debugCornerSize = 61 // the height of the debug corner
let topWidth = 500  // the width of the window at the top, not including the top corner squares
let mechanicSelectionRows = 4 // The number of rows in "mechanic selection"
let mechanicSelectionHeight = mechanicSelectionRows*30 // each row should take...30 height? I'm not sure
let middleTopHeight = 100 // the height of the window just above the main body
let bottomHeight = 150 // the height of the window at the bottom
let holeSize = 20
let cornerRounding = 10
let mainBodyHeight = topSquareSize*2 + holeSize*2 + topWidth // the height of the main window. since the main window has to be square, a different calculation is used.
let textPadding = 10
let mousePressedLastFrame = false // used sometimes

// your role
let role = "MT"

// positions: used for displaying (relative to center of arena)
let MT = [0, -50]
let OT = [50, 0]
let H1 = [-50, 0]
let H2 = [0, 50]
let M1 = [-35, 35]
let M2 = [35, 35]
let R1 = [-35, -35]
let R2 = [35, -35]

// Utopian Sky (FRU P1)
let fruP1Image

// other variables
let currentlySelectedMechanic = "Utopian Sky"
let currentlySelectedBackground = "FRU P1"
let stage = 0 // the current step you're on. always defaults to 0

function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')
    fruP1Image = loadImage('data/FRU P1 Floor.png')
}


function setup() {
    let cnv = createCanvas(topSquareSize*2 + holeSize*2 + topWidth,
        topSquareSize + mechanicSelectionHeight + middleTopHeight + mainBodyHeight + bottomHeight + debugCornerSize + holeSize*5)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

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
}


function draw() {

    // the green square at the top-left TODO
    fill(120, 80, 50)
    noStroke()
    rect(0, 0, topSquareSize, topSquareSize, cornerRounding)

    // the top window TODO
    fill(234, 34, 24)
    noStroke()
    rect(topSquareSize + holeSize, 0, width - topSquareSize - holeSize,
        topSquareSize, cornerRounding)
    displayTopWindowContent()

    // the red square at the top-right TODO
    fill(350, 80, 50)
    noStroke()
    rect(width - topSquareSize, 0,
        width, topSquareSize, cornerRounding)

    // the mechanic section window TODO
    fill(234, 34, 24)
    noStroke()
    rect(0, topSquareSize + holeSize,
        width, topSquareSize + mechanicSelectionHeight + holeSize, cornerRounding)

    // the middle-top window TODO
    fill(234, 34, 24)
    noStroke()
    rect(0, topSquareSize + mechanicSelectionHeight + holeSize*2,
        width, topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize*2, cornerRounding)

    // the main body window
    fill(234, 34, 24, 10)
    noStroke()
    rect(0, topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize*3,
        width, height - debugCornerSize - bottomHeight - holeSize*2, cornerRounding)
    displayMainBodyContent()

    // the bottom window TODO
    fill(234, 34, 24)
    noStroke()
    rect(0, height - debugCornerSize - bottomHeight - holeSize, width,
        height - debugCornerSize - holeSize, cornerRounding)

    // the debug corner window
    fill(0, 0, 0)
    noStroke()
    rect(0, height - debugCornerSize, width, height, cornerRounding)
    displayDebugCorner()

    // make sure mousePressedLastFrame is updated
    mousePressedLastFrame = mouseIsPressed
}


function displayTopWindowContent() {
    noStroke()
    fill(0, 0, 100)
    text("Hi! I'm trying to make simulations for various mechanics." +
        "\nI'll try not to delete any mechanic implementations if someone" +
        "\nwants them again. Earliest mechanic: Utopian Sky from FRU." +
        "\n\nReset mechanic           Purge data        Change role from " + role,
        topSquareSize + holeSize + textPadding, textPadding + textAscent())

    // since the buttons at the bottom are useful, just...make them useful XD
    if (mouseY < topSquareSize && mouseY > textAscent()*4 + textDescent()*4 + textPadding) {
        fill(0, 0, 0, 30)

        if (mouseX > topSquareSize + holeSize && mouseX < topSquareSize + holeSize + topWidth/3) {
            rect(topSquareSize + holeSize, textAscent() * 4 + textDescent() * 4 + textPadding, topSquareSize + holeSize + topWidth / 3, topSquareSize)

            if (mouseIsPressed) {
                // so long as the mouse wasn't held down, reset the mechanic
                if (!mousePressedLastFrame) {
                    stage = 0
                    MT = [0, -50]
                    OT = [50, 0]
                    H1 = [-50, 0]
                    H2 = [0, 50]
                    M1 = [-35, 35]
                    M2 = [35, 35]
                    R1 = [-35, -35]
                    R2 = [35, -35]
                }
            }
        }

        if (mouseX > topSquareSize + holeSize + topWidth/3 && mouseX < width - topSquareSize - holeSize - topWidth/3) {
            rect(topSquareSize + holeSize + topWidth / 3, textAscent() * 4 + textDescent() * 4 + textPadding, width - topSquareSize - holeSize - topWidth / 3, topSquareSize)
        }

        if (mouseX > width - topSquareSize - holeSize - topWidth/3 && mouseX < width - topSquareSize - holeSize) {
            rect(width - topSquareSize - holeSize - topWidth/3, textAscent()*4 + textDescent()*4 + textPadding, width - topSquareSize - holeSize, topSquareSize)
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
                    stage = 0
                    MT = [0, -50]
                    OT = [50, 0]
                    H1 = [-50, 0]
                    H2 = [0, 50]
                    M1 = [-35, 35]
                    M2 = [35, 35]
                    R1 = [-35, -35]
                    R2 = [35, -35]
                }
            }
        }
    }
}

function displayMainBodyContent() {
    push()
    translate(width/2,
        width/2 + topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize * 3)
    // Futures Rewritten Ultimate phase 1 background
    if (currentlySelectedBackground === "FRU P1") {
        // background image (it's slightly tilted, I don't know why, but
        // this rotation should help)
        push()
        rotate(0.02)
        tint(0, 0, 100, 10)
        image(fruP1Image, -width/2 + 20, -width/2 + 20,
            width - 40, width - 40)
        pop()


        // death wall
        noStroke()
        fill(240, 100, 50)
        beginShape()
        for (let i = 0; i < TWO_PI; i += TWO_PI / 500) {
            vertex(cos(i) * width / 2,
                sin(i) * width / 2)
        }
        beginContour()
        for (let i = TWO_PI; i > 0; i -= TWO_PI / 500) {
            vertex(cos(i) * (width / 2 - 20),
                sin(i) * (width / 2 - 20))
        }
        endContour()
        endShape(CLOSE)


        // notches
        noStroke()
        fill(0, 0, 100)
        for (let i = 0; i < TWO_PI; i += TWO_PI / 72) {
            circle(cos(i) * (width / 2 - 15),
                sin(i) * (width / 2 - 15), 5)
        }

        // big notches on cardinals and intercardinals
        fill(120, 100, 50)
        for (let i = 0; i < TWO_PI; i += TWO_PI / 8) {
            circle(cos(i) * (width / 2 - 15),
                sin(i) * (width / 2 - 15), 10)
        }

        displayCharacterPositions()

        pop()

        // Utopian Sky
        if (currentlySelectedMechanic === "Utopian Sky") {
            // stage 0: mechanic inactive
            if (stage === 0) {
                displayGreenDot(0, 0)

                // clicking on the green dot will advance to the next stage
                if (mouseIsPressed && !mousePressedLastFrame) {
                    if (sqrt((mouseX - width / 2) ** 2 +
                        (mouseY - width / 2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3) ** 2) < 10) {
                        stage = 1
                        MT = [0, -(width/2 - 40)]
                        OT = [(width/2 - 40)*0.707, -(width/2 - 40)*0.707]
                        R2 = [(width/2 - 40), 0]
                        M2 = [(width/2 - 40)*0.707, (width/2 - 40)*0.707]
                        H2 = [0, (width/2 - 40)]
                        M1 = [-(width/2 - 40)*0.707, (width/2 - 40)*0.707]
                        H1 = [-(width/2 - 40), 0]
                        R1 = [-(width/2 - 40)*0.707, -(width/2 - 40)*0.707]
                    }
                }
            }
        }
    }
}

// display a green dot for where to go
function displayGreenDot(x, y) {
    push()
    translate(width/2,
        width/2 + topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize * 3)
    stroke(120, 100, 100)

    // if you mouse over it, dim it
    if (sqrt((mouseX - x - width/2)**2 +
        (mouseY - y - width/2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3)**2) < 10) {
        stroke(120, 100, 80)
    }
    noFill()
    strokeWeight(2)
    circle(x, y, 15)
    pop()
}

function displayCharacterPositions() {
    fill(220, 70, 80)
    stroke(50, 100, 100)
    strokeWeight(2)
    circle(MT[0], MT[1], 30)
    circle(OT[0], OT[1], 30)
    fill(120, 70, 80)
    circle(H1[0], H1[1], 30)
    circle(H2[0], H2[1], 30)
    fill(0, 70, 80)
    circle(M1[0], M1[1], 30)
    circle(M2[0], M2[1], 30)
    circle(R1[0], R1[1], 30)
    circle(R2[0], R2[1], 30)

    // display your role
    fill(50, 100, 60)
    strokeWeight(3)
    switch (role) {
        case "MT":
            circle(MT[0], MT[1], 30)
            break
        case "OT":
            circle(OT[0], OT[1], 30)
            break
        case "H1":
            circle(H1[0], H1[1], 30)
            break
        case "H2":
            circle(H2[0], H2[1], 30)
            break
        case "M1":
            circle(M1[0], M1[1], 30)
            break
        case "M2":
            circle(M2[0], M2[1], 30)
            break
        case "R1":
            circle(R1[0], R1[1], 30)
            break
        case "R2":
            circle(R2[0], R2[1], 30)
            break
    }

    fill(0, 0, 100)
    noStroke()
    textSize(20)
    textAlign(CENTER, CENTER)
    text("MT", MT[0], MT[1])
    text("OT", OT[0], OT[1])
    text("H1", H1[0], H1[1])
    text("H2", H2[0], H2[1])
    text("M1", M1[0], M1[1])
    text("M2", M2[0], M2[1])
    text("R1", R1[0], R1[1])
    text("R2", R2[0], R2[1])
}

// since all the other things that display something on top of the separate
// sections are in functions, this should be in a function too for consistency
function displayDebugCorner() {
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showBottom()
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
            textFont(fixedWidthFont, 14)

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
            textFont(fixedWidthFont, 14)

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