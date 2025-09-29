$(document).ready(function() {
    $("#id_email, #id_emailinst, #id_correoinstasoc, #id_correoinst").css({'text-transform': 'none'});

    $(".fotoperfil").fancybox();

    refineUrl();

    if (!('contains' in String.prototype)) {
        String.prototype.contains = function (str, startIndex) {
            return -1 !== String.prototype.indexOf.call(this, str, startIndex);
        };
    }

    $("*").focusin(function () {
        $('.datepicker').css({"display": "none"});
    })


    // revisar
    // window.oncontextmenu = function() {
    //             return false;
    //          };

    sinurlatrasbutton();

    $(".listaperiodos").click(function () {
        $("#periodospanel").modal("show");
    });

    $("#cerrarperiodospanel").click(function () {
        $("#periodospanel").modal("hide");
    });

    cerrar_viewhtml = function () {
        $("#viewhtml").modal("hide");
    };

    $("#seleccionarperiodospanel").click(function () {
        var pid = $("#periodoselectorall").val();
        obtenerDato('GET', '/', {'action': 'periodo', 'id': pid})
            .then(data => {
                location.href = location.pathname;
                // Aquí puedes seguir procesando los datos recibidos
            })
            .catch(error => {
                abrirnotificacionmodal("Error al cambiar de periodo");
                // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
            });
    });

    $('.dropdown-toggle').dropdown();
    $(".collapse").collapse();
    $('.tips').tooltip({});

    $(".periodoselector").click(function () {
        var pid = $(this).attr('pid');
        obtenerDato('GET', '/', {'action': 'periodo', 'id': pid})
            .then(data => {
                location.href = location.pathname;
            })
            .catch(error => {
                abrirnotificacionmodal("Error al cambiar de periodo");
            });
    });

//  efectos
    $("table tbody tr").hover(function () {
        $(this).addClass("info");
    }, function () {
        $(this).removeClass("info");
    });

    $(".btn-form").click(function () {
        bloqueointerface();
    });

    $(".bloqueo_pantalla").click(function () {
        bloqueointerface();
    });

    // $('.formdynamics').bind('click.conectar_modaldynamics', conectar_modaldynamics);
    $(document).on('click.conectar_modaldynamics', '.formdynamics', conectar_modaldynamics);

    $('.confirmacionmodal').bind('click.conectar_confirmacion', conectar_confirmacion);
    $('.viewhtml').bind('click.conectar_modaldynamics', conectar_modaldynamics);
    $('.eliminacionmodal').bind('click.conectar_modaldynamics', conectar_modaldynamics);
    $(".reportedirecto").bind("click.conectar_reporte", abrir_reporte);
    $("#formatoreporte_run").bind("click.ejecutar_reporte", ejecutar_reporte);
    $("#formatoreporte_close").bind("click.cerrar_reporte", cerrar_reporte);

    tooltips();

    history.pushState(null, null, location.href);
    window.addEventListener('popstate', function (event) {
        history.pushState(null, null, location.href);
    });

    actualizarnumerico();

    $('.imp-number, .imp-moneda, .imp-numbersmall, .imp-numbermed-right, .imp-numbermed-center, .nota').focus(function () {
        if (!parseFloat($(this).val())) {
            $(this).val("");
        }
    });

    $('.selectorfecha').keypress(function () {
        return false;
    });

    $(".ir_arriba").click(function () {
        $("#content-p, html").animate({
            scrollTop: '0px',
        }, 800);

    });

    $(window).scroll(function () {
        if ($(this).scrollTop() > 0) {
            $(".ir_arriba").slideDown(450);
        } else {
            $(".ir_arriba").slideUp(450);
        }
    });

    ancho = $(window).width();
    if (ancho < 500) {
        $('.dropdown_periodo').removeClass('pull-right').addClass('pull-left');
    } else {
        $('.dropdown_periodo').removeClass('pull-left').addClass('pull-right');
    }

    $("#select_periodo").click(function () {
        $("#select-search").focus()
    });

    $("#select-search").keyup(function (e) {
        var texto = $(this).val().toUpperCase();
        $(".periodoselector").each(function () {
            var descripcion = $(this).html();
            if (!(descripcion.toString().toUpperCase().contains(texto))) {
                $(this).parent().hide();
            } else {
                $(this).parent().show();
            }
        });
    });

    $("#item_archivolocales").click(function () {
        $.ajax({
            type: "POST",
            url: "/",
            data: {'action': 'mis_arcivoslocales'},
            success: function (data) {
                if (data.result == 'ok') {
                    $(".archivolocales").html(data.html)
                    $.unblockUI();
                } else {
                    $("#errormensaje_r").html(data.mensaje).show();
                    $.unblockUI();
                }
                $("#registro_bt").removeAttr('disabled');
            },
            error: function () {
                $.unblockUI();
                $("#registro_bt").removeAttr('disabled');
                $("#errormensaje_r").html('Error de conexión. al servidor').show();
            },
            dataType: "json"
        });
    });

    $(".cerrarmodalpdf").click(function () {
        $("#mimodalpdf").modal('hide')
    });
});

function refineUrl(){
    var url = window.location.href;
    if (url.search('info=') >= 0) {
        var link = url.substring(url.indexOf('/') + 1);
        var linkprincipal = url.substring(0, url.lastIndexOf('/') + 1);
        if (link.indexOf("?") >= 0) {
            link = url.substring(url.lastIndexOf('?') + 1);
            linkprincipal = url.substring(0, url.lastIndexOf('?'));
        }
        lista = link.split('&');
        var cadenalink = '';
        for (elemento in lista) {
            var item = lista[elemento];
            if (item.search('info=') < 0) {
                cadenalink += item + '&';
            }
        }
        if (cadenalink.length > 0) {
            cadenalink = '?' + cadenalink.substr(0, cadenalink.length - 1);
        }
        window.history.pushState("object or string", "Title", linkprincipal + cadenalink);
    }
}

function openwindow_reporte(url, width, height) {
    newwindow = window.open(url, 'name', 'height=' + height + ' ,width=' + width);
}

function openwindow(verb, url, data, target) {
    var form = document.createElement("form");
    form.action = url;
    form.method = verb;
    form.target = target || "_self";
    if (data) {
        data = data || {}
        data['csrfmiddlewaretoken'] = csrftoken;
        for (var key in data) {
            var input = document.createElement("textarea");
            input.name = key;
            input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
            form.appendChild(input);
        }
    }
    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();
}

function chequearemial() {
    obtenerDato('POST', '/api', {'a': 'checkmail'})
        .then(data => {
            if (data.mensajes) {
                $("#checkmailicon").removeClass("hidden").show();
            } else {
                $("#checkmailicon").addClass("hidden").hide();
            }
            // Aquí puedes seguir procesando los datos recibidos
        })
        .catch(error => {
            console.error('Error al obtener datos:', error.message);
            // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
        });
}

function chequearsesion() {
    obtenerDato('POST', '/api', {'a': 'checksession'})
        .then(data => {
            if (data.nuevasesion) {
                bloqueointerface();
                location.href = '/logout';
            }
            // Aquí puedes seguir procesando los datos recibidos
        })
        .catch(error => {
            console.error('Error al obtener datos:', error.message);
            // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
        });
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function sinurlatrasbutton() {
    if (location.pathname == '/') {
        $("#urlatrasbutton").remove();
    }
}

function deshabilitar(nombre) {
    $(nombre).attr({"disabled": "disabled"});
}

function habilitar(nombre) {
    $(nombre).removeAttr("disabled").removeAttr("readonly");
}

function redondeo(numero, precision){
    if (isNaN(numero) || isNaN(precision)) {
        // Asegurarse de que ambos argumentos son números
        abrirnotificacionmodal('El valor registrado no coresponde al formato numérico..')
        return NaN;
    }
    var factor = Math.pow(10, precision);
    var numRedondeado = Math.round(numero * factor) / factor;
    return numRedondeado;
}

function numerico(elemento, min, max, decimales) {
    var nvalor;
    var valor = elemento.val();

    if (valor === "") {
        valor = parseFloat(0).toFixed(decimales);
        elemento.val(valor);
        return;
    }

    valor = parseFloat(valor);
    min = parseFloat(min);
    max = parseFloat(max);
    decimales = parseInt(decimales);

    if (isNaN(valor)) {
        nvalor = min.toFixed(decimales);
        elemento.val(nvalor);
        return;
    }

    if (valor < min) {
        nvalor = min.toFixed(decimales);
        elemento.val(nvalor);
        return;
    }

    if (max > 0 && valor > max) {
        nvalor = max.toFixed(decimales);
        elemento.val(nvalor);
        return;
    } else {
        if (max === 0 && !(valor > 0)) {
            nvalor = max.toFixed(decimales);
            elemento.val(nvalor);
            return;
        }
    }

    nvalor = valor.toFixed(decimales);
    elemento.val(nvalor);
}


function logout() {
    bloqueointerface();
    localStorage.clear();
    $.ajax({
        type: "POST",
        url: "/api",
        data: {'a': 'logout'},
        success: function (data) {
            if (data.result == 'ok') {
                location.href = data.url;
            } else {
                logout();
            }
        },
        error: function () {
            logout();
        },
        dataType: "json"
    });
}

function tooltips() {
    $(".tl").tooltip({placement: "left"});
    $(".tr").tooltip({placement: "right"});
    $(".tu").tooltip({placement: "top"});
    $(".tb").tooltip({placement: "bottom"});
}

function actualizarnumerico() {
    $('.imp-number[decimal], .imp-moneda[decimal], .imp-numbersmall[decimal], .imp-numbermed-right[decimal], .imp-numbermed-center[decimal], .nota[decimal]').each(function () {
        numerico($(this), 0, 0, $(this).attr('decimal'));
    })
}

function escapeHTMLEncode(str) {
    var div = document.createElement('div');
    var text = document.createTextNode(str);
    div.appendChild(text);
    return div.innerHTML;
}

function tipo_formulario(elemento) {
    if (elemento.attr('formtype') == 'form-vertical') {
        elemento.find(".control-label").css({'float': 'none'});
        elemento.find(".label-text").css({'text-align': 'left'});
        elemento.find(".control-label").each(function () {
            var contenedor = parseFloat($(this).parent().css('width')) - 5;
            $(this).css({'width': contenedor.toString() + 'px'});
        });
        elemento.find(".control").each(function () {
            var contenedor = parseFloat($(this).parent().css('width')) - 5;
            $(this).css({'width': contenedor.toString() + 'px'});
        });
    } else {
        elemento.find(".control-label").css({'float': 'left'});
        elemento.find(".label-text").css({'text-align': 'right'});
        if (elemento.hasClass('form-modal')) {
            elemento.find(".control-group").each(function () {
                var contenedor = parseFloat($(this).parent().width());
                var porciento = (parseFloat($(this).width()) / 100);
                var tam = parseInt(contenedor * porciento);
                $(this).css({'width': tam});
            });
        }
        elemento.find(".control-label").each(function () {
            if ($(this).attr('labelwidth')) {
                $(this).css({'width': $(this).attr('labelwidth')});
            } else {
                $(this).css({'width': '150px'});
            }
        });
        elemento.find(".control").each(function () {
            var contenedor = $(this).parent().width();
            var label = parseFloat($(this).parent().find('.control-label').width());
            $(this).css({'width': ((contenedor - label) - 20).toString() + 'px'});
        });
    }
    elemento.find(".select2").css({'width': '100%'});
}
function pop_lista(arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}

function mover_posicion_arriba_pantalla() {
    $(".ir_arriba").trigger('click');
}

$(document).on("click", ".data_link", function (event) {
    let id_alert = $(this).attr("id_alert");
    let url = $(this).attr("href");
    $.post("/datos_alerta_notificaciones", {'action': 'leer_notificacion', 'id': id_alert}, function (data) {
        if (data.result == 'ok') {
            window.location.href = url;
        }
        $.unblockUI();
        return false;
    }, "json");
});

function generarDivConIcono(tipo, texto = "") {
    const icono = iconos[tipo]; // Busca el ícono según el tipo
    if (!icono) {
        console.error(`Tipo de ícono "${tipo}" no válido.`);
        return null; // Manejo de error si el tipo no existe
    }
    const div = document.createElement("div");
    div.className = "ejemplo";
    div.innerHTML = `
        <span class="icono">${icono}</span>
        <span class="texto">${texto}</span>
    `;
    return div;
}


function cargar_notificaciones() {
    let idp = $("#contenido_notificacion").attr("idp");
    $("#contenido_notificacion").empty();
    // bloqueointerface();
    $.post("/", {'action': 'notificacion', 'id': idp}, function (data) {
        if (data.result == 'ok') {
            c = 1
            estilo = ''
            visual = ''
            color = ''
            for (elemento in data.lista) {
                var chat = '';
                // if (data.lista[elemento][5]) {
                //     chat = '<div style="width: 15%" class="pull-right"><span style="color: #00B0E8; font-size: 18px" class="fa fa-comment"></span><div class="notify-chat-alert" id="numero_notificacion-chat">' + data.lista[elemento][5] + '</div></div>';
                // }
                if (data.lista.length > c) {
                    estilo = 'style="border-bottom: 2px  solid #eaeaea;"';
                } else {
                    estilo = '';
                }
                c = c + 1;
                if (data.lista[elemento][5]){

                    // visual = '<span style="position: relative; display: inline-block;"><span style="color: #1c93ef; font-size: 14px;">✔</span><span style="position: absolute; top: 0; left: 5px; color: #1c93ef; font-size: 14px;">✔</span></span>'
                    visual = '<i class="fa fa-eye tu" title="leido" style="color: rgba(103,102,102,0.94);font-size: 14px"></i>'

                }else{
                    // visual = '<i class="fa fa-circle info" style="color: #3977cc" ></i >'
                    visual = ''
                }
                $("#contenido_notificacion").append(`<div class="row-fluid notificacion-contenedor" style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;padding: 2px">
                                                        <div class="span2 hijo" style="width: 21px; align-items: center; justify-content: center;">
                                                            <div style="color: var(--${data.lista[elemento][6]}-icono)">
                                                                ${iconos[data.lista[elemento][6]]} <!-- Inserta el SVG del ícono -->
                                                            </div>
                                                        </div>
                                                        <div class="span7 hijo notificacion data_link" style="flex: 1; padding: 2px;" id_alert="${data.lista[elemento][4]}" href="${data.lista[elemento][0]}">
                                                            <div class="cabecera hijo">
                                                                <div style="color: var(--${data.lista[elemento][6]}-color)" style="">${data.lista[elemento][1]}</div>
                                                            </div>
                                                            <div style="line-height: 10px;" class="detalle hijo">
                                                                <p class="materia" style="font-size: 11.2px; text-align: justify;color: #6c6d6e;line-height: 12px">${data.lista[elemento][2]}</p>
                                                                <div class="horario hijo">
                                                                    <label style="color: #343f4a; font-size: 11px;">${data.lista[elemento][3]}</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="span3 visualizacion hijo" style="width: 20px; display: flex; align-items: center; justify-content: center;">
                                                            <div class="visualizacion hijo" style="vertical-align: middle; font-size: 15px;">
                                                                ${visual}
                                                            </div>
                                                        </div>
                                                    </div>`);

            }
        }
        $.unblockUI();
        return false;
    }, "json");
}

// function cargar_notificaciones() {
//     let idp = $("#contenido_notificacion").attr("idp");
//     $("#contenido_notificacion").empty();
//     bloqueointerface();
//     $.post("/", {'action': 'notificacion', 'id': idp}, function (data) {
//         if (data.result == 'ok') {
//             c = 1
//             estilo = ''
//             for (elemento in data.lista) {
//                 var chat = '';
//                 if (data.lista[elemento][5]) {
//                     chat = '<div style="width: 15%" class="pull-right"><span style="color: #00B0E8; font-size: 18px" class="fa fa-comment"></span><div class="notify-chat-alert" id="numero_notificacion-chat">' + data.lista[elemento][5] + '</div></div>';
//                 }
//                 if (data.lista.length > c) {
//                     estilo = 'style="border-bottom: 2px  solid #eaeaea;"';
//                 } else {
//                     estilo = '';
//                 }
//                 c = c + 1;
//                 $("#contenido_notificacion").append('<li>' +
//                     '                                        <div class="notificacion" ' + estilo + '>' +
//                     '                                            <div class="cabecera">' +
//                     '                                                <a class="btn-link" href="' + data.lista[elemento][0] + '">' + data.lista[elemento][1] + '</a>' +
//                     '                                            </div>' +
//                     '                                            <div style="line-height: 10px;" class="detalle">' +
//                     '                                                <p class="materia text-warning">' + data.lista[elemento][2] + '</p> ' + chat +
//                     '                                                <div class="horario">' +
//                     '                                                    <label style="color: #2A3542; font-size: 11px">' + data.lista[elemento][3] + '</label>' +
//                     '                                                </div>' +
//                     '                                            </div>' +
//                     '                                        </div>' +
//                     '                                    </li>')
//             }
//         }
//         $.unblockUI();
//         return false;
//     }, "json");
// }

function newPageWindow(myURL, title, myWidth, myHeight) {
    var left = (screen.width - myWidth) / 2;
    var top = (screen.height - myHeight) / 4;
    window.open(myURL, title, 'directories=no, location=no, menubar=no, scrollbars=yes, status=no, toolbar=no, channelmode=no, titlebar=no, width=' + myWidth + ', height=' + myHeight + ', top=' + top + ', left=' + left);
}

// async function cargar_numero_notificaciones(idp) {
//     // await obtener_lista_notificacion();
//     $(".notify-alert").hide();
//     $.post("/", {'action': 'num_notificacion', 'id': idp}, function(data){
//         $.unblockUI();
//         if (data.result==='ok'){
//             if (data.numero > 0) {
//                 $(".notify-alert span").html(data.numero);
//                 $(".notify-alert").show();
//             }else{
//                 $(".notify").hide();
//             }
//         }
//     }, "json" );
// }

function cargar_numero_notificaciones(idp) {
    $(".notify-alert").hide();
    $.post("/", {'action': 'num_notificacion', 'id': idp}, function(data){
        $.unblockUI();
        if (data.result=='ok'){
            if (data.numero > 0) {
                $(".notify-alert").show();
                $(".notify-alert span").html(data.numero);
            }else{
                $(".notify").hide();
            }
        }
    }, "json" );
}