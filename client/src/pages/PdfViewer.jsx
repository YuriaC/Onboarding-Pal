// import React from 'react';
// import { useEffect, useState } from "react";
// import { pdfjs } from 'react-pdf';
// import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// // Create styles

// const styles = StyleSheet.create({
//   page: {
//     flexDirection: 'row',
//     backgroundColor: '#E4E4E4'
//   },
//   section: {
//     margin: 10,
//     padding: 10,
//     flexGrow: 1
//   }
// });
// const [pdfFile, setPdfFile] = useState('');
// const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

// const showPdf = () => {
//     // window.open(`http://localhost:5000/files/${pdf}`, "_blank", "noreferrer");
//     setPdfFile(`http://localhost:3000/pdfs/dummy.pdf`)
//   };
// // Create Document Component
// const MyDocument = () => (
//   <Document file={pdfUrl}>
//         <button
//         className="btn btn-primary"
//         onClick={() => showPdf()}
//       >
//         Show Pdf
//       </button>
//       <PdfComp pdfFile={pdfFile}/>
//   </Document>
// );


// export default MyDocument

import { useState } from "react";
import { Document, Page } from "react-pdf";

function MyDocument(props) {
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  //const filename="./dummy.pdf";
  return (
    <div className="pdf-div">
           <p>
        Page {pageNumber} of {numPages}
      </p>
      <Document file={props.pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.apply(null, Array(numPages))
          .map((x, i) => i + 1)
          .map((page, j) => {
            return (
              <Page key={j}
                pageNumber={page}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            );
          })}
      </Document>
    </div>
  );
}
export default MyDocument;
