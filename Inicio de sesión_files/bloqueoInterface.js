// function bloqueointerface(){
//     if (!$(".blockUI").length){
//         $.blockUI({
//             message: $('#throbber'),
//             css: {
//                 border: '1px solid',
//                 borderRadius : '10px',
//                 left: '50%',
//                 width:'120px',
//                 padding: '15px',
//                 '-webkit-border-radius': '10px',
//                 '-moz-border-radius': '10px',
//                 opacity: 0.6,
//                 color: '#000',
//                 backgroundColor: '#fff'
//             },
//             overlayCSS: {
//                 backgroundColor: '#000',
//                 opacity: 0.5,
//                 cursor: 'wait'
//             }
//         });
//     }
// }
//
// window.onload = function() {
//     document.getElementById('loader').style.display = 'none';
//     document.getElementById('content').style.display = 'block';
// };

function bloqueointerface(){
    if (!$(".blockUI").length){
        $.blockUI({
            message: $('#throbber'),
            css: {
                // border: '1px solid',
                borderRadius : '10px',
                left: '46.5%',
                width:'120px',
                height: '120px',
                padding: '10px',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                opacity: 0.6,
                color: '#000',
                backgroundColor: '#fff'
            },
            overlayCSS: {
                backgroundColor: '#000',
                opacity: 0.5,
                cursor: 'wait'
            }
        });
    }
}