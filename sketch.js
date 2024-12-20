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

// your role
let role = "MT"

// positions: used for displaying (relative to center of arena)
let MT = [0, -100]
let OT = [100, 0]
let H1 = [0, 100]
let H2 = [-100, 0]
let M1 = [-77, 77]
let M2 = [77, 77]
let R1 = [-77, -77]
let R2 = [77, -77]

// Utopian Sky (FRU P1)
let fruP1Image

// other variables
let currentlySelectedMechanic = "Utopian Sky"
let currentlySelectedBackground = "FRU P1"
let millisSinceMechStarted // advanced feature for timing how fast you did the mechanic TODO
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
    background(234, 34, 24)

    // erase the background afterward
    erase()
    rect(0, 0, width, height)
    noErase()

    // the green square at the top-left TODO
    fill(120, 80, 50)
    noStroke()
    rect(0, 0, topSquareSize, topSquareSize, cornerRounding)

    // the top window TODO
    fill(234, 34, 24)
    noStroke()
    rect(topSquareSize + holeSize, 0, width - topSquareSize - holeSize,
        topSquareSize, cornerRounding)

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
    fill(234, 34, 24)
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
}

function displayMainBodyContent() {
    // Futures Rewritten Ultimate phase 1 background
    if (currentlySelectedBackground === "FRU P1") {
        // background image
        image(fruP1Image, 20, topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize * 3 + 20,
            width - 40, width - 40)


        // death wall
        noStroke()
        fill(240, 100, 50)
        beginShape()
        for (let i = 0; i < TWO_PI; i += TWO_PI / 500) {
            vertex(cos(i) * width / 2 + width / 2,
                sin(i) * width / 2 + width / 2 + topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize * 3)
        }
        beginContour()
        for (let i = TWO_PI; i > 0; i -= TWO_PI / 500) {
            vertex(cos(i) * (width / 2 - 20) + width / 2,
                sin(i) * (width / 2 - 20) + width / 2 + topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize * 3)
        }
        endContour()
        endShape(CLOSE)


        // notches
        noStroke()
        fill(0, 0, 100)
        for (let i = -0.02; i < TWO_PI; i += TWO_PI / 72) {
            circle(cos(i) * (width / 2 - 20) + width / 2,
                sin(i) * (width / 2 - 20) + width / 2 + topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize * 3,
                5)
        }

        // big notches on cardinals and intercardinals
        fill(120, 100, 50)
        for (let i = -0.02; i < TWO_PI; i += TWO_PI / 8) {
            circle(cos(i) * (width / 2 - 20) + width / 2,
                sin(i) * (width / 2 - 20) + width / 2 + topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize * 3,
                10)
        }

        // Utopian Sky TODO
    }
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