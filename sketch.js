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
let scalingFactor = 4/3
let topSquareSize = 50*scalingFactor // the size of the top corner squares
let topWidth = 250*scalingFactor  // the width of the window at the top, not including the top corner squares
let mechanicSelectionRows = 4*scalingFactor // the number of rows in "mechanic selection"
let mechanicSelectionHeight = mechanicSelectionRows*15*scalingFactor
let middleTopHeight = 50*scalingFactor // the height of the window just above the main body
let bottomHeight = 50*scalingFactor // the height of the window at the bottom
let holeSize = 10*scalingFactor
let cornerRounding = 10*scalingFactor
let mainBodyHeight = topSquareSize*2 + holeSize*2 + topWidth // the height of the main window. since the main window has to be square, a different calculation is used.
let windowWidth = topSquareSize*2 + holeSize*2 + topWidth
let textPadding = 5*scalingFactor
let mousePressedLastFrame = false // used sometimes

// your role
let role = "MT"

// positions: used for displaying (relative to center of arena)
let MT = [0, -50*scalingFactor]
let OT = [50*scalingFactor, 0]
let H1 = [-50*scalingFactor, 0]
let H2 = [0, 50*scalingFactor]
let M1 = [-35*scalingFactor, 35*scalingFactor]
let M2 = [35*scalingFactor, 35*scalingFactor]
let R1 = [-35*scalingFactor, -35*scalingFactor]
let R2 = [35*scalingFactor, -35*scalingFactor]

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

// Utopian Sky (FRU P1)
let fruP1Image
let unsafeClones
let spreadOrStack
let safeDirections

// other variables
let currentlySelectedMechanic = "Utopian Sky"
let currentlySelectedBackground = "FRU P1"
let stage = 0 // the current step you're on. always defaults to 0
let textAtTop
let textAtBottom

function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')
    fruP1Image = loadImage('data/FRU P1 Floor.png')
}


function setup() {
    let cnv = createCanvas(topSquareSize*2 + holeSize*2 + topWidth,
        topSquareSize + mechanicSelectionHeight + middleTopHeight + mainBodyHeight + bottomHeight + holeSize*4)
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

    setupUtopianSky()

    greenSquareX = 0
    greenSquareY = 0
    redSquareX = width - topSquareSize
    redSquareY = 0
    topWindowX = topSquareSize + holeSize
    topWindowY = 0
    selectionX = 0
    selectionY = topWindowY + topSquareSize + holeSize
    middleTopX = 0
    middleTopY = selectionY + mechanicSelectionHeight + holeSize
    mainBodyX = 0
    mainBodyY = middleTopY + middleTopHeight + holeSize
    bottomWindowX = 0
    bottomWindowY = mainBodyY + mainBodyHeight + holeSize

    textAlign(CENTER, CENTER)
}


function draw() {
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

    // the mechanic section window TODO
    fill(234, 34, 24)
    noStroke()
    rect(selectionX, selectionY, selectionX + windowWidth, selectionY + mechanicSelectionHeight, cornerRounding)

    // the middle-top window
    fill(234, 34, 24)
    noStroke()
    rect(middleTopX, middleTopY, middleTopX + windowWidth, middleTopY + middleTopHeight, cornerRounding)
    textAlign(LEFT, TOP)
    displayMiddleTopWindowContent()

    // the main body window
    fill(234, 34, 24, 3)
    noStroke()
    rect(mainBodyX, mainBodyY, mainBodyX + windowWidth, mainBodyY + mainBodyHeight, cornerRounding)
    displayMainBodyContent()

    // the bottom window
    fill(234, 34, 24)
    noStroke()
    rect(0, height - bottomHeight, width,
        height, cornerRounding)
    displayBottomWindowContent()


    // used in emergencies. also a nice treat for those who accidentally
    // pressed backtick
    displayDebugCorner()

    // make sure mousePressedLastFrame is updated
    mousePressedLastFrame = mouseIsPressed
}


function displayTopWindowContent() {
    textAlign(LEFT, BASELINE)
    noStroke()
    fill(0, 0, 100)
    text("Hi! I'm trying to make simulations for various mechanics." +
        "\nI'll try not to delete any mechanic implementations if someone" +
        "\nwants them again. Earliest mechanic: Utopian Sky from FRU." +
        "\n\nReset mechanic           Purge data        Change role from " + role,
        topWindowX + textPadding, topWindowY + textPadding + textAscent())

    // since the buttons at the bottom are useful, just...make them useful XD
    if (mouseY < topWindowY + topSquareSize && mouseY > topWindowY + textAscent()*4 + textDescent()*4 + textPadding) {
        fill(0, 0, 0, 30)

        if (mouseX > topWindowX && mouseX < topWindowX + topWidth/3) {
            rect(topWindowX, topWindowY + textAscent() * 4 + textDescent() * 4 + textPadding, topSquareSize + holeSize + topWidth / 3, topWindowY + topSquareSize, cornerRounding)

            if (mouseIsPressed) {
                // so long as the mouse wasn't held down, reset the mechanic
                if (!mousePressedLastFrame) {
                    mousePressedLastFrame = true
                    reset()
                }
            }
        }

        if (mouseX > topWindowX + topWidth/3 && mouseX < topWindowX + 2*topWidth/3) {
            rect(topWindowX + topWidth/3, topWindowY + textAscent() * 4 + textDescent() * 4 + textPadding, topWindowX + 2*topWidth/3, topWindowY + topSquareSize, cornerRounding)
        }

        if (mouseX > topWindowX + 2*topWidth/3 && mouseX < topWindowX + topWidth) {
            rect(topWindowX + 2*topWidth/3, topWindowY + textAscent()*4 + textDescent()*4 + textPadding, topWindowX + topWidth, topWindowY + topSquareSize, cornerRounding)
            if (mouseIsPressed) {
                // so long as the mouse wasn't held down, change roles
                if (!mousePressedLastFrame) {
                    mousePressedLastFrame = true
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
        image(fruP1Image, -width/2 + 20*scalingFactor, -width/2 + 20*scalingFactor,
            width - 40*scalingFactor, width - 40*scalingFactor)
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
            vertex(cos(i) * (width / 2 - 20*scalingFactor),
                sin(i) * (width / 2 - 20*scalingFactor))
        }
        endContour()
        endShape(CLOSE)


        // notches
        noStroke()
        fill(0, 0, 100)
        for (let i = 0; i < TWO_PI; i += TWO_PI / 72) {
            circle(cos(i) * (width / 2 - 15*scalingFactor),
                sin(i) * (width / 2 - 15*scalingFactor), 5)
        }

        // big notches on cardinals and intercardinals
        fill(120, 100, 50)
        for (let i = 0; i < TWO_PI; i += TWO_PI / 8) {
            circle(cos(i) * (width / 2 - 15*scalingFactor),
                sin(i) * (width / 2 - 15*scalingFactor), 10)
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
                displayClone([0, -width/4], false)

                // clicking on the green dot will advance to the next stage
                if (mouseIsPressed && !mousePressedLastFrame) {
                    mousePressedLastFrame = true
                    if (sqrt((mouseX - width / 2) ** 2 +
                        (mouseY - width / 2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3) ** 2) < 10*scalingFactor) {
                        stage = 1

                        // the distance everyone will go to get to their clock
                        // spots
                        let spreadRadius = width*3/7

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
                            " so you \ncan't tell anymore."

                        // make the arena foggy
                        background(0, 0, 50)
                        for (let j = 0; j < 10; j += 1) {
                            fill(0, 0, 60)
                            noStroke()
                            for (let i = 0; i < height; i += 5*scalingFactor) {
                                circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 25*scalingFactor, i / 50 + 50*scalingFactor))
                                circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 25*scalingFactor, i / 50 + 50*scalingFactor))
                                circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 25*scalingFactor, i / 50 + 50*scalingFactor))
                            }
                            fill(0, 0, 70)
                            for (let i = 0; i < height; i += 5*scalingFactor) {
                                rect(random(0, width*2/3), random(i, i + 10*scalingFactor), random(width/3, width), random(i + 40*scalingFactor, i + 50*scalingFactor))
                                rect(random(0, width*2/3), random(i, i + 10*scalingFactor), random(width/3, width), random(i + 40*scalingFactor, i + 50*scalingFactor))
                                rect(random(0, width*2/3), random(i, i + 10*scalingFactor), random(width/3, width), random(i + 40*scalingFactor, i + 50*scalingFactor))
                            }
                            fill(0, 0, 90)
                            for (let i = 0; i < height; i += 5*scalingFactor) {
                                circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 10*scalingFactor, i / 50 + 30*scalingFactor))
                                circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 10*scalingFactor, i / 50 + 30*scalingFactor))
                                circle(random(0, width), random(i, i + 25*scalingFactor), random(i / 50 + 10*scalingFactor, i / 50 + 30*scalingFactor))
                            }
                            fill(0, 0, 100)
                            for (let i = 0; i < height; i += 5*scalingFactor) {
                                rect(random(0, width*2/3), random(i, i + 40*scalingFactor), random(width/3, width), random(i + 20*scalingFactor, i + 50*scalingFactor))
                                rect(random(0, width*2/3), random(i, i + 40*scalingFactor), random(width/3, width), random(i + 20*scalingFactor, i + 50*scalingFactor))
                                rect(random(0, width*2/3), random(i, i + 40*scalingFactor), random(width/3, width), random(i + 20*scalingFactor, i + 50*scalingFactor))
                            }
                        }
                    }
                }
            } if (stage === 1) { // stage 1: clones have just appeared
                let raisedArm = unsafeClones.includes(role)
                let cloneRadius = width*2/7
                let innerGreenDotRadius = width*2/7
                let outerGreenDotRadius = width*3/7
                let innerGreenDotPosition
                let outerGreenDotPosition

                stroke(0, 0, 80)
                // where to display clone and dots?
                switch (role) {
                    case "MT":
                        displayClone([0, -cloneRadius], raisedArm)
                        displayGreenDot(0, -innerGreenDotRadius)
                        displayGreenDot(0, -outerGreenDotRadius)
                        innerGreenDotPosition = [0, -innerGreenDotRadius]
                        outerGreenDotPosition = [0, -outerGreenDotRadius]
                        break
                    case "OT":
                        displayClone([cloneRadius*0.707, -cloneRadius*0.707], raisedArm)
                        displayGreenDot(innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707)
                        displayGreenDot(outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707]
                        break
                    case "R2":
                        displayClone([cloneRadius, 0], raisedArm)
                        displayGreenDot(innerGreenDotRadius, 0)
                        displayGreenDot(outerGreenDotRadius, 0)
                        innerGreenDotPosition = [innerGreenDotRadius, 0]
                        outerGreenDotPosition = [outerGreenDotRadius, 0]
                        break
                    case "M2":
                        displayClone([cloneRadius*0.707, cloneRadius*0.707], raisedArm)
                        displayGreenDot(innerGreenDotRadius*0.707, innerGreenDotRadius*0.707)
                        displayGreenDot(outerGreenDotRadius*0.707, outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [outerGreenDotRadius*0.707, outerGreenDotRadius*0.707]
                        break
                    case "H2":
                        displayClone([0, cloneRadius], raisedArm)
                        displayGreenDot(0, innerGreenDotRadius)
                        displayGreenDot(0, outerGreenDotRadius)
                        innerGreenDotPosition = [0, innerGreenDotRadius]
                        outerGreenDotPosition = [0, outerGreenDotRadius]
                        break
                    case "M1":
                        displayClone([-cloneRadius*0.707, cloneRadius*0.707], raisedArm)
                        displayGreenDot(-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707)
                        displayGreenDot(-outerGreenDotRadius*0.707, outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [-innerGreenDotRadius*0.707, innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [-outerGreenDotRadius*0.707, outerGreenDotRadius*0.707]
                        break
                    case "H1":
                        displayClone([-cloneRadius, 0], raisedArm)
                        displayGreenDot(-innerGreenDotRadius, 0)
                        displayGreenDot(-outerGreenDotRadius, 0)
                        innerGreenDotPosition = [-innerGreenDotRadius, 0]
                        outerGreenDotPosition = [-outerGreenDotRadius, 0]
                        break
                    case "R1":
                        displayClone([-cloneRadius*0.707, -cloneRadius*0.707], raisedArm)
                        displayGreenDot(-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707)
                        displayGreenDot(-outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707)
                        innerGreenDotPosition = [-innerGreenDotRadius*0.707, -innerGreenDotRadius*0.707]
                        outerGreenDotPosition = [-outerGreenDotRadius*0.707, -outerGreenDotRadius*0.707]
                        break
                }

                let veryInnerRadius = width/7

                // handle clicking on the green dots
                if (sqrt((mouseX - innerGreenDotPosition[0] - width/2)**2 +
                    (mouseY - innerGreenDotPosition[1] - width/2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3)**2) < 10*scalingFactor) {
                    if (mouseIsPressed && !mousePressedLastFrame) {
                        mousePressedLastFrame = true
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
                } if (sqrt((mouseX - outerGreenDotPosition[0] - width/2)**2 +
                        (mouseY - outerGreenDotPosition[1] - width/2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3)**2) < 10*scalingFactor) {
                    if (mouseIsPressed && !mousePressedLastFrame) {
                        mousePressedLastFrame = true
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
                }
            } if (stage === 2) {
                let innerGreenDotRadius = width/7
                let outerGreenDotRadius = width*3/7
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
                if (sqrt((mouseX - innerGreenDotPosition[0] - width/2)**2 +
                    (mouseY - innerGreenDotPosition[1] - width/2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3)**2) < 10*scalingFactor) {
                    // the INNER dot
                    if (mouseIsPressed && !mousePressedLastFrame) {
                        mousePressedLastFrame = true
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
                } if (sqrt((mouseX - outerGreenDotPosition[0] - width/2)**2 +
                    (mouseY - outerGreenDotPosition[1] - width/2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3)**2) < 10*scalingFactor) {
                    // the OUTER dot
                    if (mouseIsPressed && !mousePressedLastFrame) {
                        mousePressedLastFrame = true
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
                }
            } if (stage === 3) {
                // final stage—just clear it already!!! XD
                let stackSpot
                let spreadSpot
                let lightParty
                let outerRadius = width*3/7 // where everyone will be
                // when next to the death wall
                let innerRadius = width*2/7 // where the tank will be
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
                if ((sqrt((mouseX - spreadSpot[0] - width/2)**2 +
                    (mouseY - spreadSpot[1] - width/2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3)**2) < 10*scalingFactor)
                    && !(role === "H1" || role === "H2")) {
                    if (mouseIsPressed && !mousePressedLastFrame) {
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
                } if (sqrt((mouseX - stackSpot[0] - width/2)**2 +
                    (mouseY - stackSpot[1] - width/2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3)**2) < 10*scalingFactor) {
                    if (mouseIsPressed && !mousePressedLastFrame) {
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
                                textAtBottom = "You went to your stack spot." +
                                    " \n[PASS] It's either stack or" +
                                    " spread—who knows, you're a healer." +
                                    " [CLEARED]"
                            }

                            stage = 99
                        }
                    }
                }
            }
        }
    }
}

function displayClone(position, raisedArm) {
    push()
    translateToCenterOfBoard()
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
    translate(width/2,
        width/2 + topSquareSize + mechanicSelectionHeight + middleTopHeight + holeSize * 3)
}

// display a green dot for where to go
function displayGreenDot(x, y) {
    push()
    translateToCenterOfBoard()
    stroke(120, 100, 100)

    // if you mouse over it, dim it
    if (sqrt((mouseX - x - width/2)**2 +
        (mouseY - y - width/2 - topSquareSize - mechanicSelectionHeight - middleTopHeight - holeSize * 3)**2) < 10*scalingFactor) {
        stroke(120, 100, 80)
    }
    noFill()
    strokeWeight(scalingFactor)
    circle(x, y, 15*scalingFactor)
    pop()
}

function displayCharacterPositions() {
    fill(220, 70, 80)
    stroke(50, 100, 100)
    strokeWeight(scalingFactor)
    circle(MT[0], MT[1], 15*scalingFactor)
    circle(OT[0], OT[1], 15*scalingFactor)
    fill(120, 70, 80)
    circle(H1[0], H1[1], 15*scalingFactor)
    circle(H2[0], H2[1], 15*scalingFactor)
    fill(0, 70, 80)
    circle(M1[0], M1[1], 15*scalingFactor)
    circle(M2[0], M2[1], 15*scalingFactor)
    circle(R1[0], R1[1], 15*scalingFactor)
    circle(R2[0], R2[1], 15*scalingFactor)

    // display your role
    fill(50, 100, 60)
    strokeWeight(scalingFactor*1.5)
    switch (role) {
        case "MT":
            circle(MT[0], MT[1], 15*scalingFactor)
            break
        case "OT":
            circle(OT[0], OT[1], 15*scalingFactor)
            break
        case "H1":
            circle(H1[0], H1[1], 15*scalingFactor)
            break
        case "H2":
            circle(H2[0], H2[1], 15*scalingFactor)
            break
        case "M1":
            circle(M1[0], M1[1], 15*scalingFactor)
            break
        case "M2":
            circle(M2[0], M2[1], 15*scalingFactor)
            break
        case "R1":
            circle(R1[0], R1[1], 15*scalingFactor)
            break
        case "R2":
            circle(R2[0], R2[1], 15*scalingFactor)
            break
    }

    fill(0, 0, 100)
    noStroke()
    textSize(10*scalingFactor)
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
    rect(0, height - bottomHeight, width,
        height, cornerRounding)

    fill(0, 0, 100)
    text(textAtBottom, textPadding, height - bottomHeight + textPadding)
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
    }
}

function setupUtopianSky() {
    erase()
    rect(0, 0, width, height)
    noErase()

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
    print(unsafeClones)

    spreadOrStack = random(["spread", "stack"])

    // if it's spread, briefly make the background blue—if it's red, briefly
    // make the background red
    if (spreadOrStack === "spread") {
        background(240, 100, 100)
    } else {
        background(0, 100, 100)
    }

    textAtTop = "How fast can you really execute Utopian Sky? Because it's" +
        " time to test just that.\nAlso, please do remember that it's " + spreadOrStack +
        "s first.\n\nThe way the simulation works can be a bit confusing." +
        " You'll get the hang of it eventually.\nReady? Click on the green" +
        " dot in the center."
    textAtBottom = "You went to your default starting spot for this" +
        " simulation. \n[PASS] — You got to this page."
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