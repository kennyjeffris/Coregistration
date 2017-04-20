/*
* Coregistration Script to overlay Magnetic Particle Imaging (MPI) scans
* over Computed Tomography (CT) scans in Adobe Photoshop.
* Developed for the Berkeley Imaging Laboratory.
* University of California, Berkeley.
* @author Kenny Jeffris
*/

// Only execute in Photoshop
if (BridgeTalk.appName == "photoshop") {
//continue executing script
}

// Close all open documents - Option to save beforehand.
while (app.documents.length) {
app.activeDocument.close()
}

// Remember current unit settings and then set units to
// the value expected by this script.
var originalUnit = preferences.rulerUnits;
app.preferences.rulerUnits = Units.CM

// Create a prompt to confirm that all of the necessary data is known.
var dataConfirmed = confirm("Have you measured the lengths " +
"of your CT and MPI images?");

if (!dataConfirmed) {
  alert("Restart this script after obtaining the necessary data!")
} else {

  /*
  * Obtain images for use with a file select dialog.
  * Choose one CT image with the first prompt.
  * Choose as many MPI images as desired with the second.
  * Multi-select with ctl + click (Windows), cmd + click (Mac OS)
  * CT and MPI images must have the same orientation (supine, sagital, etc.)
  * for proper overlay.
  *
  * The user must have image length data (units of cm) for proper sizing.
  */

  // CT.
  var chooseCT = app.openDialog("Choose your CT image");
  // MPI.
  var chooseMPI = app.openDialog("Select all the MPI images you wish to overlay");

  // Open the CT image in the first Ps document.
  var ctImage = open(File(chooseCT[0].toString()));
  // Obtain user input data on CT image length (reference from Osirix).
  var ctrefLength = UnitValue(parseInt(prompt("What is the width of your CT Image")), 'cm');
  // CT Image Length after cropping (from image, not normalized to reference).
  var ctLength = ctImage.width;
  // CT Image Height after cropping (from image, not normalized to reference).
  var ctHeight = ctImage.height;

  // Rotate image to be horizontal (if necessary).
  if (ctHeight > ctLength) {
    ctImage.rotateCanvas(90);
    var holdLength = ctLength;
    ctLength = ctHeight;
    ctHeight = holdLength;
  }
  // CT image resolution.
  var ctResolution = ctImage.resolution.valueOf();
  // Ratio of obtained length to defined reference length.
  var ctresFactor = ctLength / ctrefLength;
  // Scales the resolution by the length ratio to maintain quality.
  var newctResolution = ctResolution * ctresFactor;
  // Scale the obtained image height.
  var newctHeight = ctHeight / ctresFactor;
  // Make the CT image the activeDocument for resizing.
  app.activeDocument = ctImage;
  // Scale the image based on the input reference length.
  ctImage.resizeImage(ctrefLength, newctHeight,
    newctResolution, ResampleMethod.AUTOMATIC, 0);

  // Obtain user input data on CT image length (Should be 10.6 cm).
  var mpirefLength = UnitValue(parseInt(
    prompt("What is the width of your MPI image?")), 'cm');

  // Repeat the MPI image process for every selected image.
  for (i = 0; i < chooseMPI.length; i++) {
    // Open the MPI image in the next available Ps document.
    var workingMPI = open(File(chooseMPI[i].toString()));

    // MPI Image Length after cropping (from image, not normalized to reference).
    var mpiLength = workingMPI.width;
    // MPI Image Height after cropping (from image, not normalized to reference).
    var mpiHeight = workingMPI.height;

    // Rotate image to be horizontal (if necessary).
    if (mpiHeight > mpiLength) {
      workingMPI.rotateCanvas(90);
      var dummy = ctLength;
      ctLength = ctHeight;
      ctHeight = dummy;
    }

    // MPI image resolution.
    var mpiResolution = workingMPI.resolution.valueOf();
    // Ratio of obtained length to defined reference length.
    var mpiresFactor = mpiLength / mpirefLength;
    // Scales the resolution by the length ratio to maintain quality.
    var newmpiResolution = mpiResolution * mpiresFactor;
    // Scale the obtained image height.
    var mpinewHeight = mpiHeight / mpiresFactor;
    // Obtain size ratios of CT to MPI.
    var widthRatio = ctImage.width / workingMPI.width;
    var heightRatio = ctImage.height / workingMPI.height;
    // Scale the image based on the input reference length.
    workingMPI.resizeImage(ctrefLength, newctHeight,
      ctImage.resolution, ResampleMethod.AUTOMATIC, 0);

    // Create blank Ps document for the overlay image based on CT size.
    var mergedDoc = app.documents.add(ctImage.width, ctImage.height,
      ctImage.resolution, "overlay " + i.toString());

    // Make CT image the activeDocument (for copying).
    app.activeDocument = ctImage;
    // Copy the entire image.
    ctImage.activeLayer.copy();
    // Make the new Ps doc the activeDocument (for pasting).
    app.activeDocument = mergedDoc;
    // Select the active region.
    mergedDoc.selection.selectAll();
    // Paste the CT image.
    mergedDoc.paste();

    // Make CT image the activeDocument (for copying).
    app.activeDocument = workingMPI;
    // Copy the entire image.
    workingMPI.activeLayer.copy();
    // Make the new Ps doc the activeDocument (for pasting).
    app.activeDocument = mergedDoc;
    // Select the active region.
    mergedDoc.selection.selectAll();
    // Paste the MPI image.
    mergedDoc.paste();
    // Set the Transparency of the MPI image to Screen.
    activeDocument.activeLayer.blendMode = BlendMode.SCREEN;
    // Close the MPI image without saving.
    workingMPI.close(SaveOptions.SAVECHANGES);
  }

  // Close the CT image without saving.
  ctImage.close(SaveOptions.SAVECHANGES);
  activeDocument = documents[0];
  var text = "After this script ends, move the top layer (MPI image) to " +
  "the desired location on the CT image and run the second script (coreg2.jsx)";
  alert(text);

  // Reset Photoshop to oringinal units
  preferences.rulerUnits = originalUnit

}
