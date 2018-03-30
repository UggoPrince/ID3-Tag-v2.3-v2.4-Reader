// JavaScript Document

var myReader = new FileReader(); // native file reader object

// constructor that reads a file
function AudioReader()
	{
		//this.file = '';
		this.fileNumber = 0;
		this.totalFiles = 0;
		this.readTagHeader = null;
		this.readFileTags = null;
		this.processHeader = null;
		this.processTags = null;
		this.tagHeader = [];
		this.currentTagSize = 0;
		this.currentFileNumber = 0;
		
		this.input = '';
		this.buff = ''; // buffer
		
		this.tagIndex = [];
		this.index_And_Tag = {};
		this.tag_And_Index = {};
		this.tagData = {};
		this.deTag = [];
		this.imageData = [];
		this.imageTagIndex = [];
		this.imageTagEnd = [];
		
		this.AudioFile = {
			File:{}, // holds file
			ID:{}, // index and name
			Size:{}, // hold file size
			TextData:{}, // holds data of file read as text
			TagData:{}, //
			ImageData:{}, //
			Total:0,
			ID3Tag:{
				Version:{}, // id3 tag version
				Size:{}, //
				Title:{}, // title of audio
				Author:{}, // arthor / artist
				Author2:{}, //
				Album:{}, //
				Year:{}, //
				Genre:{}, //
				CoverArt:{}
				} // hold file version
			}; // end object ID3Tag
	} // end constructor Reader

var myAudioReader = new AudioReader(); // Reader object

// read file
AudioReader.prototype.readFile = function(event)
	{
		var allFiles = myAudioReader.input.files;
		var file = myAudioReader.AudioFile;		
		var allSize = 0;
		var fname = '';
		var readContinues = false;
		file.Total = allFiles.length;
		
		for(var i = 0; i < allFiles.length; i++)
		{
			fname = allFiles[i].name;
			file.ID[i] = fname;
			file.File[fname] = allFiles[i];
			file.Size[fname] = allFiles[i].size;
			//myAudioReader.myFiles.push( allFiles[ i ] );
			allSize += allFiles[i].size;
		}
		
		var mySize = myAudioReader.getTotalFileSize(allSize); // get total file(s) size in megabytes
		
		if(mySize > 100.00)
		{
			file.ID = {}; // empty file id
			file.File = {}; // empty file(s)
			file.Size = {}; //
			alert('size of file(s) greater than 100mb')
		}
		else
		{
			readContinues = true;
		}
		
		if( readContinues )
		{
			// get tag sizes
			myAudioReader.readTagHeader = true;
			myAudioReader.processHeader = true;
			myAudioReader.processTags = true;
			myAudioReader.getTagHeader();
		}
	} // end method readFile

// get size of file(s) selectes
AudioReader.prototype.getTotalFileSize = function(size)
	{
		return ( size / ( 1024 * 1024 ) ).toFixed(2);
	} // end method getFileSize

// get tag size of file(s)
AudioReader.prototype.getTagHeader = function()
	{
		var file = myAudioReader.AudioFile;
		var i = myAudioReader.currentFileNumber;
		var name = file.ID[i]
		var header = file.File[ name ].slice(0, 10);
			myAudioReader.readArrayBuffer( header );
	} // end method getTagSize

// get all tags and tag data
AudioReader.prototype.getFileTags = function()
	{
		var f = myAudioReader.AudioFile;
		var i = myAudioReader.currentFileNumber;
		var name = f.ID[i];
		var size = '';
		var version = f.ID3Tag.Version[ name ];
		
		if( version == 3 || version == 4)
		{
			size = f.ID3Tag.Size[ name ];
			var file = f.File[ name ].slice(10, size);
			myAudioReader.readArrayBuffer( file );
		}
		
	} // end method getFileTags

// read file as text
AudioReader.prototype.readText = function(file)
	{
		myReader.readAsText(file);
	} // end method readText

// read file as binary
AudioReader.prototype.readArrayBuffer = function(Data)
	{
		myReader.readAsArrayBuffer( Data );
	} // end method readBinary


// get all read data
AudioReader.prototype.getReadData = function(event)
	{
		if( myAudioReader.readTagHeader )
		{
			myAudioReader.buff = event.target.result;
		}
		else if( myAudioReader.readFileTags )
		{
			myAudioReader.buff = event.target.result;
		}
		console.log(event.target.result);
	} // end method getReadData	
	

// when all data has been read
AudioReader.prototype.readEnd = function(event)
	{
		console.log(event.target.result);
		var file = myAudioReader.AudioFile;
		var i = myAudioReader.currentFileNumber;
		
		if( myAudioReader.readTagHeader )
		{
			myAudioReader.tagHeader[ i ] = myAudioReader.buff;
			myAudioReader.buff = '';
			
			if( myAudioReader.currentFileNumber < file.Total - 1 )
			{
				++myAudioReader.currentFileNumber;
				myAudioReader.getTagHeader();
			}
			else
			{
				myAudioReader.readTagHeader = false;
				myAudioReader.currentFileNumber = 0;
				myAudioReader.processor();
			}
		}
		else if( myAudioReader.readFileTags )
		{
			var name = file.ID[ i ];
			file.TagData[ name ] = myAudioReader.buff;
			
			if( myAudioReader.currentFileNumber < file.Total - 1 )
			{
				++myAudioReader.currentFileNumber;
				myAudioReader.buff = '';
				myAudioReader.getFileTags();
			}
			else
			{
				myAudioReader.currentFileNumber = 0;
				myAudioReader.buff = '';
				myAudioReader.readFileTags = false;
				myAudioReader.processor();
			}
		}
	} // end method getReadData

// pad binary data with zeros to make 7 characters
AudioReader.prototype.padZero = function( x )
	{
		if( x.length < 7 )
		{
			for( var i = x.length; i < 7; i++ )
			{
				x = "0" + x;
			}
			return  x;
		}
		else if( x.length == 8)
		{
			var a = x.substring(0, x.length )
			 return a;
	   	}
	   	else if( x.length == 7 )
	   		return x;
	} // end method padZero

// convert any number to any base
AudioReader.prototype.base = function( n, to, from )
	{
			return parseInt ( n, from || 10 ) .toString ( to ) ;
	} // end method base

// method sorts an array numerically
AudioReader.prototype.sortNumArray = function(a, b)
	{
		return a - b;
	} // end method sortNumArray

// call appropiate processor
AudioReader.prototype.processor = function()
	{
		if( myAudioReader.processHeader )
		{
			myAudioReader.processTagHeader();
		}
		else if( myAudioReader.processTags )
		{
			myAudioReader.processTag();
		}
	} // end method processor

// process the tag sizes
AudioReader.prototype.processTagHeader = function()
	{
		var file = myAudioReader.AudioFile;
		var header = size = v = view = fname = id3 = byteLen = '';
		
		for( var i = 0; i < file.Total; i++ )
		{
			fname = file.ID[i];
			header = new DataView( myAudioReader.tagHeader[i] );
			byteLen = header.byteLength;
			
			id3 = String.fromCharCode( header.getInt8(0), header.getInt8(1), header.getInt8(2) );
			
			if( id3 == 'ID3' )
			{
				v = header.getInt8(3);
				if( v == 3 )
					file.ID3Tag.Version[fname] = 3;
				else if( v == 4 )
					file.ID3Tag.Version[fname] = 4;
			}
			
			for( var j = 6; j < byteLen; j++ )
			{
				var jj = header.getInt8(j);
				jj = myAudioReader.base(jj, 16, 10); // convert to hex
				jj = myAudioReader.padZero( myAudioReader.base(jj, 2, 16) ); // convert to binary and prefix with zero(s) (0)
				size += jj;
			}
			file.ID3Tag.Size[fname] = myAudioReader.base(size, 10, 2); // convert tag size to decimal			
			
		} // end for
		myAudioReader.tagHeader = [];
		myAudioReader.processHeader = false;
		myAudioReader.readFileTags = true;
		myAudioReader.getFileTags();
	} // end method processTagSize
	
// get tag data
AudioReader.prototype.getTagData = function( startPoint, view )
	{
		var jj = 4 + startPoint;
		
		tagContent = myAudioReader.getTextTagData( jj, view);
		console.log(jj);
		return tagContent;
	} // end method getTagData

// get the content of text tags like Title, Album, etc
AudioReader.prototype.getTextTagData = function( startPoint, view )
	{
		var tagSize = '';
		for( var s = 0; s < 4; s++ )
		{
			var t = view.getInt8( startPoint + s );
			t = myAudioReader.base( t, 16, 10);
			t = myAudioReader.padZero( myAudioReader.base( t, 2, 16 ) );
			tagSize += t;
		}
		tagSize = myAudioReader.base( tagSize, 10, 2);
		myAudioReader.currentTagSize = parseInt( tagSize, 10 );
		var tagContent = '';
						
		for( var ss = 0; ss < tagSize; ss++ )
		{
			tagContent += String.fromCharCode(view.getInt8(ss + startPoint + 4 + 2));
		}
		var regEx = /[^\w- !@|.,#&]/ig
		tagContent = tagContent.replace(regEx, '');
		console.log( tagContent );
		return tagContent;
	} // end method getTextTagData

AudioReader.prototype.getImageTagData = function( startPoint, arrayBuffer )
	{
		var tagSize = data = '';
		var textEncoding = mimeType = picType = desc = k = JF = '';
		var zero = false;
		var zeroCount = 0;
		var r = /-/;
		var JFI = '747073'; // JFIF = '74707370';
		var Exi = '69120105'; // Exif = '69120105102';
		var PNG = '807871';
		var view = new DataView( arrayBuffer );
		var fileNum = myAudioReader.currentFileNumber;
		var file = myAudioReader.AudioFile;
		var fname = file.ID[ fileNum ]; 
		
		for( var s = 0; s < 4; s++ )
		{
			var t = view.getInt8( startPoint + s );
			var tt = t + '';
			t = tt.replace(r, '');
			t = myAudioReader.base( t, 16, 10);
			//alert( t );
			t = myAudioReader.padZero( myAudioReader.base( t, 2, 16 ) );
			tagSize += t;
		} // end for
		
		tagSize = myAudioReader.base( tagSize, 10, 2);
		startPoint += 6;
		imageData = '';	
		var imgArrayBuffer;
		var loopCount = tagSize;
				
		for( var i = startPoint, j = 0; i < loopCount; i++, j++ )
		{
			if( j == 0)
			{
				textEncoding += view.getInt8( i );
			}
			else if( j > 0 && j < 12 )
			{
				var mime = view.getInt8( i );
				if( mime == 0 );
				else
				{
					mimeType += String.fromCharCode( mime );
				}
			}
			
			if( j == 12 )
			{
				picType = view.getInt8( i );
			}
			
			if( !zero )
			{
				var imgMark = view.getInt8( i );
				if( imgMark == 74 || imgMark == 69 || imgMark == 80 )
				{
					JF = view.getInt8( i ) + '' + view.getInt8( i + 1 ) + view.getInt8( i + 2 );
					if( JF == PNG )
					{
						zero = true;
						i -= 1;
						loopCount = i;
						console.log( i );
					}
					else if( JF == JFI )
					{
						JF = view.getInt8( i ) + '' + view.getInt8( i + 1 ) + view.getInt8( i + 2 ) + view.getInt8( i + 3 );
						if( JF == JFI + '70')
						{
							zero = true;
							i -= 6;
							loopCount = i;
							console.log( i );
						}
					}
					else if( JF == Exi )
					{
						JF = view.getInt8( i ) + '' + view.getInt8( i + 1 ) + view.getInt8( i + 2 ) + view.getInt8( i + 3 );
						if( JF == Exi + '102' )
						{
							zero = true;
							i -= 6;
							loopCount = i;
							console.log( i );
						}
					}
				}
			}
			if( zero )
			{
				console.log( i );
				imgArrayBuffer = arrayBuffer.slice( i, tagSize + 1 );
				var imgBlob = new Blob( [ imgArrayBuffer ], {type: 'image/jpeg' } );
				console.log( imgArrayBuffer );
				
				if( imgBlob )
				{
					file.ImageData[ fname ] = imgBlob;
					var imgURL = window.URL.createObjectURL( imgBlob );
				}
				else
				{
					file.ImageData[ fname ] = '';
					var imgURL = '';
				}
			}
		} // end for
		
		myAudioReader.currentTagSize = parseInt( tagSize, 10 );
		var tagContent = '';
		console.log( imgURL );
		
		return imgURL;//return imageData;
	} // end getImageData
	

// process audio media read as text	
AudioReader.prototype.processTag = function()
	{
		infoDiv.innerHTML = '';
		var file = myAudioReader.AudioFile;
		var id3 = myAudioReader.AudioFile.ID3Tag;
		var fname = '';
		
						
		for ( var j = 0; j < file.Total; j++ )
		{
			fname = file.ID[ j ]; // file index
			var view = new DataView( file.TagData[ fname ] );
			var version = id3.Version[ fname ];
			myAudioReader.currentFileNumber = j;
			
			var byt4 = tagContent = '';
			var n = 0;
			if( version == 3 || version == 4)
			{
				for ( var jj = 0; jj < view.byteLength; jj++ )
				{
					byt4 = view.getInt8( jj );
					if( byt4 == 84 )
					{
						n = view.getInt8( jj ) + '' + view.getInt8( jj+1 ) + view.getInt8( jj+2 ) + view.getInt8( jj+3 );
						switch( n )
						{	
							case TAG[ 'TIT2' ]:
							console.log( 'Title' );
							id3.Title[ fname ] = myAudioReader.getTagData( jj, view );
							jj += myAudioReader.currentTagSize;
							break;
							
							case TAG[ 'TPE1' ]:
							console.log( 'Artist 1' );
							id3.Author[ fname ] = myAudioReader.getTagData( jj, view );
							jj += myAudioReader.currentTagSize;
							break;
							
							case TAG[ 'TPE2' ]:
							console.log( 'Artist 2' );
							id3.Author2[ fname ] = myAudioReader.getTagData( jj, view );
							jj += myAudioReader.currentTagSize;
							break;
							
							case TAG[ 'TALB' ]:
							console.log( 'Album' );
							id3.Album[ fname ] = myAudioReader.getTagData( jj, view );
							jj += myAudioReader.currentTagSize;
							break;
							
							case TAG[ 'TYER' ]:
							console.log( 'Year' );
							id3.Year[ fname ] = myAudioReader.getTagData( jj, view );
							jj += myAudioReader.currentTagSize;
							break;
							
							case TAG[ 'TCON' ]:
							console.log( 'Year' );
							id3.Genre[ fname ] = myAudioReader.getTagData( jj, view );
							jj += myAudioReader.currentTagSize;
							break;
						} // end switch
					} // end if
				} // end for
			} // end if
		} // end for
		
		// get image
		for ( var m = 0; m < file.Total; m++ )
		{
			fname = file.ID[ m ]; // file index
			var view = new DataView( file.TagData[ fname ] );
			var version = id3.Version[ fname ];
			myAudioReader.currentFileNumber = m;
			
			if( version == 3 || version == 4)
			{
				for ( var mm = 0; mm < view.byteLength; mm++ )
				{
					var byt4 = view.getInt8( mm );
					if( byt4 == 65 )
					{
						n = view.getInt8( mm ) + '' + view.getInt8( mm+1 ) + view.getInt8( mm+2 ) + view.getInt8( mm+3 );
						if( n == TAG[ 'APIC' ] )
						{
							console.log( 'Picture' );
							id3.CoverArt[ fname ] = myAudioReader.getImageTagData( mm, file.TagData[ fname ] );
							mm += myAudioReader.currentTagSize;
						}
					}
				}
			}
		} // end for

		
		myAudioReader.processTags = false;
		myAudioReader.currentFileNumber = 0;
		myAudioReader.displayData();
		
	} // end method processText
	
// check if a data exist and return true else return false
AudioReader.prototype.testData = function(data)
	{
		if(data) return true;
		else return false;
	}; // end method testData

// display data
AudioReader.prototype.displayData = function()
	{
		var file = myAudioReader.AudioFile;
		
		for ( var x = 0; x < file.Total; x++ )
		{
			var fname = file.ID[ x ];
			
			var img = new Image();
			img.style.display = 'inlineBlock';
			img.src = file.ID3Tag.CoverArt[ fname ];
			var textDiv = document.createElement('div');
			textDiv.className = 'textDiv';
			textDiv.style.display = 'inlineBlock';
			
			
			try
			{
				if( file.ID3Tag.Author[ fname ] )	
					textDiv.innerHTML += 'Artist : ' + file.ID3Tag.Author[ fname ] + '<br>';
				else
					textDiv.innerHTML += 'Artist : ' + file.ID3Tag.Author2[ fname ] + '<br>';
					
				if( file.ID3Tag.Title[ fname ] )
					textDiv.innerHTML += 'Title : ' + file.ID3Tag.Title[ fname ] + '<br>';
				
				if( file.ID3Tag.Album[ fname ] )
					textDiv.innerHTML += 'Album : ' + file.ID3Tag.Album[ fname ] + '<br>';
					
				if( file.ID3Tag.Year[ fname ])
					textDiv.innerHTML += 'Year : ' + file.ID3Tag.Year[ fname ] + '<br>';
				
				if( file.ID3Tag.Genre[ fname ])
					textDiv.innerHTML += 'Genre : ' + file.ID3Tag.Genre[ fname ] + '<br>';
					
				/*var elm = document.createElement('input');
				elm.setAttribute('type', 'text');
				elm.setAttribute('name', 'title'+x);
				elm.className = 'displayNone';
				form.appendChild(elm);*/
				
				infoDiv.appendChild(img);
				infoDiv.appendChild(textDiv);
			}
			catch( err )
			{
				alert(err.message);
			}
		} // end for
		
		myAudioReader.resetAudioObjects();
		
	} // end displayData

// reset all audio objects	
AudioReader.prototype.resetAudioObjects = function()
	{
		myAudioReader.deTag = [];		
		myAudioReader.tagData = {};
		myAudioReader.tagIndex = [];
		myAudioReader.index_And_Tag = {};
		myAudioReader.tag_And_Index = {};
		
		var file = myAudioReader.AudioFile;
		file.ID = {};
		file.File = {};
		file.Size = {};
		file.TextData = {};
		file.Total = 0;
		file.ID3Tag.Arthor = {};
		file.ID3Tag.Arthor2 = {};
		file.ID3Tag.Title = {};
		file.ID3Tag.Album = {};
		file.ID3Tag.Size = {};
		file.ID3Tag.Year = {};
		file.ID3Tag.Genre = {};
		file.ID3Tag.Version = {};
	} // end method resetAudioObjects
	
function setupReader()
	{
		try
		{
			infoDiv = document.getElementById('infoDiv');
			myAudioReader.input = document.getElementById('fileInput');
			
			myAudioReader.readFormat = 'asText';
			
			myAudioReader.input.addEventListener('change', myAudioReader.readFile);
					
			myReader.addEventListener('load', myAudioReader.getReadData);
			
			myReader.addEventListener('loadend', myAudioReader.readEnd);
		}
		catch( err )
		{
			alert(err.message);
		}
		
	} // end function setupReader


var TAG = {
	'APIC' : '65807367', // Cover Art
	'TALB' : '84657666', // Album
	'TIT2' : '84738450', // Title
	'TPE1' : '84806949', // Artist
	'TPE2' : '84806950', // Artist2
	'TYER' : '84896982', // year
	'TCON' : '84677978' // Genre
}

document.addEventListener('DOMContentLoaded', setupReader);