$(document).ready(function () {
     $(document).on('click', '.alertaTemprana', function () {
        var id = $(this).attr('id');
        if (!id) {
            abrirnotificacionmodal('No se encontró el acceso para abrir la alerta temprana.');
            return;
        }

        bloqueointerface();
        $.ajax({
            type: "GET",
            url: `/alerta_temprana`, // Enviamos el id como parámetro GET
            data: { id: id }, // Pasamos el id como parámetro GET
            dataType: "json"
        })
            .done(function(response) {
                $.unblockUI();
                if (response.result === "ok") {
                    abrirModalDetalle(response.html, response.title || "Detalles del producto");
                } else {
                    abrirnotificacionmodal(response.mensaje || 'Error al cargar el contenido del modal.');
                }
            })
            .fail(function() {
                $.unblockUI();
                abrirnotificacionmodal('Error al cargar el contenido del modal.');
            });
    });
});


function abrirModalDetalle(html, titulo = '', ancho = '800px', alto = '500px', habilitarcerrar = true, obligatoria = false, icono = "fa fa-list-ul", coloricono = "goldenrod") {
    if (titulo.length > 0) {
        $(".tituloModalDetalle").html(titulo);
    }
    if (habilitarcerrar) {
        $('.modalDetalle').find(".modal-footer").show();
    } else {
        $('.modalDetalle').find(".modal-footer").hide();
    }
    $("#iconoModalDetalle").addClass(icono);
    document.getElementById('iconoModalDetalle').style.color = coloricono;
    $(".cuerpoModalDetalle").html(html);
    document.getElementById('cuerpoModalDetalle').style.height = alto;
    document.getElementById('cuerpoModalDetalle').style.maxHeight = alto;
    $('.modalDetalle').modal({'backdrop': 'static', keyboard: obligatoria, 'width': ancho, 'height': 'auto'}).modal('show');
}

function cerrarModalDetalle(elemento) {
    // $(".modalDetalle").modal("hide");
    $(elemento).closest('.modal').modal('hide');
}