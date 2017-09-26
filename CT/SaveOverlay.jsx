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

  /*
  * Remember current unit settings and then set units to
  * the value expected by this script.
  */
  var originalUnit = preferences.rulerUnits;
  app.preferences.rulerUnits = Units.CM

  /*
  * Obtain the XY coordinates of the top left corner of the MPI image of the
  * adjusted document.
  */
  var layerBounds = activeDocument.activeLayer.bounds;
  var deltaX = layerBounds[0];
  var deltaY = layerBounds[1];

  // Choose folders to save PSD and PNG files to, respectively.
  var psdoutputFolder = Folder.selectDialog("Choose folder to Photoshop files to");
  var pngoutputFolder = Folder.selectDialog("Choose folder to Image files to");

  // Save the first document
  var i = 0;
  save();

  // Translate remaining MPI layers based on reference.
  for (i = 1; i < documents.length; i++) {
    activeDocument = documents[i];
    documents[i].activeLayer.translate(deltaX, deltaY);
    save();
  }

  // Save a copy of the image as PSD and PNG
  function save(){
    app.activeDocument.name = "overlayed-image-" + i;
    var Name = app.activeDocument.name;
    var psdsaveFile = File(psdoutputFolder + "/" + Name +".psd");
    var pngsaveFile = File(pngoutputFolder + "/" + Name +".png");
    SavePSD(psdsaveFile);
    SavePNG(pngsaveFile);
  }

  // Save as PSD with default settings.
  function SavePSD(saveFile){
    psdSaveOptions = new PhotoshopSaveOptions();
    psdSaveOptions.embedColorProfile = true;
    psdSaveOptions.alphaChannels = true;
    activeDocument.saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);
  }

  //Save as PNG with default settings.
  function SavePNG(saveFile){
      pngSaveOptions = new PNGSaveOptions();
      activeDocument.saveAs(saveFile, pngSaveOptions, true, Extension.LOWERCASE);
  }

  // Reset Photoshop to oringinal units
  preferences.rulerUnits = originalUnit
}
