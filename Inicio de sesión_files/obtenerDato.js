
function obtenerDato(tipo, url, objeto) {
    return new Promise((resolve, reject) => {
        bloqueointerface();
        $.ajax({
            type: tipo,
            url: url,
            data: objeto,
            success: function (data) {
                if (data.result === "ok") {
                    resolve(data);
                } else {
                    abrirnotificacionmodal(data.mensaje);
                    reject(new Error(data.mensaje));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $.unblockUI();
                abrirnotificacionmodal('Error de conexión.');
                reject(new Error('Error de conexión: ' + textStatus)); // Rechazar la promesa con detalles del error
            },
            complete: function () {
                $.unblockUI(); // Desbloquear la UI independientemente del resultado
            }
        });
    });
}
async function obtenerModal(type, url, dataAction, elemtoModal, titulo) {
    try {
        bloqueointerface();
        let response = await $.ajax({
            type: type,
            url: url,
            data: dataAction,
            dataType: "json"
        });
        $.unblockUI(); // Desbloqueo de UI después de recibir respuesta
        if (response.result === 'ok') {
            elemtoModal.find('.paneltitle').html(titulo);
            elemtoModal.find('.modal-body').html(response.html);
            elemtoModal.modal({ backdrop: "static",  width: "1000px", keyboard: false });
            elemtoModal.modal('show');
        } else {
            abrirnotificacionmodal(response.mensaje);
        }
    } catch (error) {
        $.unblockUI();
        abrirnotificacionmodal('Error de conexión: ' + error.message);
    }
    return false;
}

function cerrarModal(elemento) {
    $(elemento).closest('.modal').modal('hide');
}

