$(document).on('click', '.action_delete', function () {
    const action = $(this).data('action');
    const id = $(this).data('id');
    const name = $(this).data('name');
    const msj_question = $(this).data('question') !== undefined ? $(this).data('question') : '';
    const requestPath = window.location.pathname;
    let parentItem = getParentItem($(this));

    const idaux = $(this).data('idaux') !== undefined ? $(this).data('idaux') : '';
    const elemento_bloque = $(this).data('elemento_bloque') !== undefined ? $(this).data('elemento_bloque') : null;

    if (elemento_bloque){
        parentItem = $(`${elemento_bloque}`).parent();
    }

    showConfirmationModal(name, msj_question);

    $('#confirmDelete').off('click').on('click', function () {
        $('#confirmationModal').modal('hide');
        sendDeleteRequest(action, id, parentItem, requestPath, idaux);
    });

    $('#closeDelete').off('click').on('click', function () {
        $('#confirmationModal').modal('hide');
    });
});

function getParentItem(element) {
    if (element.closest('.div-item').length > 0) {
        return element.closest('.div-item');
    }

    if (element.closest('tr').length > 0) {
        return element.closest('tr');
    } else if (element.closest('li').length > 0) {
        return element.closest('li');
    }

    return element.parent();
}

function showConfirmationModal(name, msj_question='') {
    let question = `Al eliminar el registro no podrá volver a recuperar los datos. <br>¿Está seguro de eliminar el registro, <b>${name}</b>?`;
    if (msj_question){
        question = `${msj_question}. <br>¿Está seguro de eliminar el registro <span class="badge bg-info">${name}</span>?`;
    }
    $('#confirmationMessage').html(question);
    $('#confirmationModal').modal({ 'width': '450' }).modal('show');
}

function sendDeleteRequest(action, id, parentItem, requestPath, idaux=null) {
    bloqueointerface();

    let data = { 'action': action, 'id': id };

    if (idaux !== null) { // Si idaux existe y no es null, lo agregamos
        data.idaux = idaux;
    }

    $.ajax({
        type: "POST",
        url: requestPath,
        data: data,
        dataType: "json",
        beforeSend: function(xhr, settings) {
            // Método alternativo: establecer CSRF token en headers
            xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
        },
        success: function (data) {
            handleSuccessResponse(data, parentItem);
        },
        error: handleError
    });
}

function handleSuccessResponse(data, parentItem) {
    $.unblockUI();
    if (data.result === 'ok') {
        if (data.reload){
            location.reload();
        }else{
            if (data.idElemento){
                let elemento = document.getElementById(data.idElemento);
                const parentItem = getParentItem(elemento);
                parentItem.remove();
            }
            parentItem.remove();
        }
    } else {
        abrirnotificacionmodal(data.mensaje);
    }
}

function handleError(jqXHR, textStatus, errorThrown) {
    $.unblockUI();
    const errorMessage = `Error de conexión: ${textStatus} - ${errorThrown}`;
    abrirnotificacionmodal(errorMessage);
}

function getCSRFToken() {
    // Método 1: Desde una meta tag (recomendado)
    let token = $('meta[name=csrf-token]').attr('content');

    if (!token) {
        // Método 2: Desde input hidden
        token = $('input[name=csrfmiddlewaretoken]').val();
    }

    if (!token) {
        // Método 3: Desde cookies (si está configurado)
        token = getCookie('csrftoken');
    }

    return token;
}

// Función auxiliar para obtener cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}