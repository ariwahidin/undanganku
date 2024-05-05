jQuery(document).ready(function ($) {
  $(this).find(':submit').removeAttr("disabled");
  TK = {
    ajaxurl: TK_WP.ajaxurl,
    nonce: TK_WP.lfNonce,
    textCounter: TK_WP.textCounter,
    textCounterNum: (TK_WP.textCounterNum !== '') ? TK_WP.textCounterNum : 300,
    jpages: TK_WP.jpages,
    numPerPage: (TK_WP.jPagesNum !== '') ? TK_WP.jPagesNum : 10,
    widthWrap: (TK_WP.widthWrap !== '') ? TK_WP.widthWrap : '',
    autoLoad: TK_WP.autoLoad,
    thanksComment: TK_WP.thanksComment,
    thanksReplyComment: TK_WP.thanksReplyComment,
    duplicateComment: TK_WP.duplicateComment,
    insertImage: TK_WP.insertImage,
    insertVideo: TK_WP.insertVideo,
    insertLink: TK_WP.insertLink,
    accept: TK_WP.accept,
    cancel: TK_WP.cancel,
    reply: TK_WP.reply,
    checkVideo: TK_WP.checkVideo,
    textWriteComment: TK_WP.textWriteComment,
    classPopularComment: TK_WP.classPopularComment,
  };

  //Remove duplicate comment box
  jQuery('.tk-wrap-comments').each(function (index, element) {
    var ids = jQuery('[id=\'' + this.id + '\']');
    if (ids.length > 1) {
      ids.slice(1).closest('.tk-wrapper').remove();
    }
  });

  //Remove id from input hidden comment_parent and comment_post_ID. Para prevenir duplicados
  jQuery('.tk-container-form [name="comment_parent"], .tk-container-form [name="comment_post_ID"]').each(function (index, input) {
    $(input).removeAttr('id');
  });


  // Textarea Counter Plugin
  // if (typeof jQuery.fn.textareaCount == 'function' && TK.textCounter == 'true') {
  //   $('.tk-textarea').each(function () {
  //     var textCount = {
  //       'maxCharacterSize': TK.textCounterNum,
  //       'originalStyle': 'tk-counter-info',
  //       'warningStyle': 'tk-counter-warn',
  //       'warningNumber': 20,
  //       'displayFormat': '#left'
  //     };
  //     $(this).textareaCount(textCount);
  //   });
  // }

  // PlaceHolder Plugin
  if (typeof jQuery.fn.placeholder == 'function') {
    $('.tk-wrap-form input, .tk-wrap-form textarea, #tk-modal input, #tk-modal textarea').placeholder();
  }
  // Autosize Plugin
  if (typeof autosize == 'function') {
    autosize($('textarea.tk-textarea'));
  }

  //Actualizamos alturas de los videos
  $('.tk-wrapper').each(function () {
    rezizeBoxComments_TK($(this));
    restoreIframeHeight($(this));
  });
  $(window).resize(function () {
    $('.tk-wrapper').each(function () {
      rezizeBoxComments_TK($(this));
      restoreIframeHeight($(this));
    });
  });

  // CAPTCHA
  if ($('.tk-captcha').length) {
    captchaValues = captcha_TK(9);
    $('.tk-captcha-text').html(captchaValues.n1 + ' &#43; ' + captchaValues.n2 + ' = ');
  }

  // OBTENER COMENTARIOS

  $(document).delegate('a.tk-link', 'click', function (e) {
    e.preventDefault();
    var linkVars = getUrlVars_TK($(this).attr('href'));
    var post_id = linkVars.post_id;
    var num_comments = linkVars.comments;
    var num_get_comments = linkVars.get;
    var order_comments = linkVars.order;
    $("#tk-wrap-commnent-" + post_id).slideToggle(200);
    var $container_comment = $('#tk-container-comment-' + post_id);
    if ($container_comment.length && $container_comment.html().length === 0) {
      getComments_TK(post_id, num_comments, num_get_comments, order_comments);
    }
    return false;
  });
  // CARGAR COMENTARIOS AUTOMÁTICAMENTE

  if ($('a.tk-link').length) {
    $('a.tk-link.auto-load-true').each(function () {
      $(this).click();
    });
  }

  //Mostrar - Ocultar Enlaces de Responder, Editar
  // $(document).delegate('li.tk-item-comment', 'mouseover mouseout', function (event) {
  //   event.stopPropagation();
  //   if (event.type === 'mouseover') {
  //     $(this).find('.tk-comment-actions:first').show();
  //   } else {
  //     $(this).find('.tk-comment-actions').hide();
  //   }
  // });

  //Cancelar acciones
  $(document).find('.tk-container-form').keyup(function (tecla) {
    post_id = $(this).find('form').attr('id').replace('commentform-', '');
    if (tecla.which == 27) {
      cancelCommentAction_TK(post_id);
    }
  });

  //Mostrar - Ocultar Enlaces de Responder, Editar
  $(document).delegate('input.tk-cancel-btn', 'click', function (event) {
    event.stopPropagation();
    post_id = $(this).closest('form').attr('id').replace('commentform-', '');
    cancelCommentAction_TK(post_id);
  });

  // RESPONDER COMENTARIOS
  $(document).delegate('.tk-reply-link', 'click', function (e) {
    e.preventDefault();
    var linkVars = getUrlVars_TK($(this).attr('href'));
    var comment_id = linkVars.comment_id;
    var post_id = linkVars.post_id;
    //Restauramos cualquier acción
    cancelCommentAction_TK(post_id);
    var form = $('#commentform-' + post_id);
    form.find('[name="comment_parent"]').val(comment_id);//input oculto con referencia al padre
    form.find('.tk-textarea').val('').attr('placeholder', TK_WP.reply + '. ESC (' + TK_WP.cancel + ')').focus();
    form.find('input[name="submit"]').addClass('tk-reply-action');
    $('#commentform-' + post_id).find('input.tk-cancel-btn').show();
    //scroll
    scrollThis_TK(form);

    return false;
  });

  //EDITAR COMENTARIOS
  $(document).delegate('.tk-edit-link', 'click', function (e) {
    e.preventDefault();
    var linkVars = getUrlVars_TK($(this).attr('href'));
    var comment_id = linkVars.comment_id;
    var post_id = linkVars.post_id;
    //Restauramos cualquier acción
    cancelCommentAction_TK(post_id);
    var form = $('#commentform-' + post_id);
    form.find('[name="comment_parent"]').val(comment_id);//input oculto con referencia al padre
    form.find('.tk-textarea').val('').focus();
    form.find('input[name="submit"]').addClass('tk-edit-action');
    //scroll
    scrollThis_TK(form);
    getCommentText_TK(post_id, comment_id);
  });

  //ELIMINAR COMENTARIOS
  $(document).delegate('.tk-delete-link', 'click', function (e) {
    e.preventDefault();
    var linkVars = getUrlVars_TK($(this).attr('href'));
    var comment_id = linkVars.comment_id;
    var post_id = linkVars.post_id;
    if (confirm(TK_WP.textMsgDeleteComment)) {
      deleteComment_TK(post_id, comment_id);
    }
  });

  $('input, textarea').focus(function (event) {
    $(this).removeClass('tk-error');
    $(this).siblings('.tk-error-info').hide();
  });

  // ENVIAR COMENTARIO
  $(document).on('submit', '.tk-container-form form', function (event) {
    event.preventDefault();
    $(this).find(':submit').attr("disabled", "disabled");
    $('input, textarea').removeClass('tk-error');
    var formID = $(this).attr('id');
    var post_id = formID.replace('commentform-', '');
    var form = $('#commentform-' + post_id);
    var link_show_comments = $('#tk-link-' + post_id);
    var num_comments = link_show_comments.attr('href').split('=')[2];
    var form_ok = true;

    // VALIDAR COMENTARIO
    var $content = form.find('textarea').val().replace(/\s+/g, ' ');
    //Si el comentario tiene menos de 2 caracteres no se enviará
    if ($content.length < 2) {
      form.find('.tk-textarea').addClass('tk-error');
      form.find('.tk-error-info-text').show();
      setTimeout(function () {
        form.find('.tk-error-info-text').fadeOut(500);
      }, 2500);
      $(this).find(':submit').removeAttr('disabled');
      return false;
    }
    else {
      // VALIDAR CAMPOS DE TEXTO
      if ($(this).find('input#author').length) {
        var $author = $(this).find('input#author');
        var $authorVal = $author.val().replace(/\s+/g, ' ');
        var $authorRegEx = /^[^?%$=\/]{1,30}$/i;

        if ($authorVal == ' ' || !$authorRegEx.test($authorVal)) {
          $author.addClass('tk-error');
          form.find('.tk-error-info-name').show();
          setTimeout(function () {
            form.find('.tk-error-info-name').fadeOut(500);
          }, 3000);
          form_ok = false;
        }
      }
      if ($(this).find('input#email').length) {
        var $emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;
        var $email = $(this).find('input#email');
        var $emailVal = $email.val().replace(/\s+/g, '');
        $email.val($emailVal);

        if (!$emailRegEx.test($emailVal)) {
          $email.addClass('tk-error');
          form.find('.tk-error-info-email').show();
          setTimeout(function () {
            form.find('.tk-error-info-email').fadeOut(500);
          }, 3000);
          form_ok = false;
        }
      }
      if (!form_ok) {
        $(this).find(':submit').removeAttr('disabled');
        return false;
      }

      // VALIDAR CAPTCHA
      if ($('.tk-captcha').length) {
        var captcha = $('#tk-captcha-value-' + post_id);
        form_ok = true;
        if (captcha.val() != (captchaValues.n1 + captchaValues.n2)) {
          form_ok = false;
          captcha.addClass('tk-error');
        }
        captchaValues = captcha_TK(9);
        $('.tk-captcha-text').html(captchaValues.n1 + ' &#43; ' + captchaValues.n2 + ' = ');
        captcha.val('');
      }

      //Si el formulario está validado
      if (form_ok === true) {
        //Si no existe campo lo creamos
        if (!form.find('input[name="comment_press"]').length) {
          form.find('input[name="submit"]').after('<input type="hidden" name="comment_press" value="true">');
        }
        comment_id = form.find('[name="comment_parent"]').val();
        //Insertamos un nuevo comentario
        if (form.find('input[name="submit"]').hasClass('tk-edit-action')) {
          editComment_TK(post_id, comment_id);
        }
        else if (form.find('input[name="submit"]').hasClass('tk-reply-action')) {
          insertCommentReply_TK(post_id, comment_id, num_comments);
        }
        else {
          insertComment_TK(post_id, num_comments);
        }
        cancelCommentAction_TK(post_id);
      }
      $(this).find(':submit').removeAttr('disabled');
    }
    return false;
  });//end submit

  function getComments_TK(post_id, num_comments, num_get_comments, order_comments) {
    var status = $('#tk-comment-status-' + post_id);
    var $container_comments = $("ul#tk-container-comment-" + post_id);
    if (num_comments > 0) {
      jQuery.ajax({
        type: "POST",
        dataType: "html",// tipo de información que se espera de respuesta
        url: TK.ajaxurl,
        data: {
          action: 'get_comments',
          post_id: post_id,
          get: num_get_comments,
          order: order_comments,
          nonce: TK.nonce
        },
        beforeSend: function () {
          status.addClass('tk-loading').html('<span class="lfo-loading"></span>').show();
        },
        success: function (data) {
          status.removeClass('tk-loading').html('').hide();
          $container_comments.html(data);
          highlightPopularComments_TK(post_id, $container_comments);
          $container_comments.show();//Mostramos los Comentarios
          //Insertamos Paginación de Comentarios
          jPages_TK(post_id, TK.numPerPage);
          toggleMoreComments($container_comments);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          clog('ajax error');
          clog('jqXHR');
          clog(jqXHR);
          clog('errorThrown');
          clog(errorThrown);
        },
        complete: function (jqXHR, textStatus) {
        }
      });//end jQuery.ajax
    }//end if
    return false;
  }//end function


  function highlightPopularComments_TK(post_id, $container_comments) {
    var order = $container_comments.data('order');
    if (order == 'likes' && $container_comments.hasClass('tk-multiple-comments tk-has-likes')) {
      var top_likes = $container_comments.find('>.tk-item-comment').eq(0).data('likes');
      var temp = false;
      $container_comments.find('>.tk-item-comment').each(function (index, comment) {
        if (!temp && $(comment).data('likes') == top_likes) {
          $(comment).addClass(TK.classPopularComment);
          temp = true;
        }
      });
    }
  }

  function jQFormSerializeArrToJson(formSerializeArr) {
    var jsonObj = {};
    jQuery.map(formSerializeArr, function (n, i) {
      jsonObj[n.name] = n.value;
    });

    return jsonObj;
  }

  function insertComment_TK(post_id, num_comments) {
    var link_show_comments = $('#tk-link-' + post_id);
    var comment_form = $('#commentform-' + post_id);
    var status = $('#tk-comment-status-' + post_id);
    var form_data = comment_form.serialize();//obtenemos los datos

    $.ajax({
      type: 'post',
      method: 'post',
      url: comment_form.attr('action'),
      data: form_data,
      dataType: "html",
      beforeSend: function () {
        status.addClass('tk-loading').html('<span class="lfo-loading"></span>').show();
      },
      success: function (data, textStatus) {
        cc('success data', data)
        status.removeClass('tk-loading').html('');
        if (data != "error") {
          status.html('<p class="tk-ajax-success">' + TK.thanksComment + '</p>');
          if (link_show_comments.find('span').length) {
            num_comments = String(parseInt(num_comments, 10) + 1);
            link_show_comments.find('span').html(num_comments);
          }
        }
        else {
          status.html('<p class="tk-ajax-error">Error processing your form</p>');
        }
        //Agregamos el nuevo comentario a la lista
        $('ul#tk-container-comment-' + post_id).prepend(data).show();
        //Actualizamos el Paginador
        jPages_TK(post_id, TK.numPerPage, true);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        status.removeClass('tk-loading').html('<p class="tk-ajax-error" >' + TK.duplicateComment + '</p>');
      },
      complete: function (jqXHR, textStatus) {
        setTimeout(function () {
          status.removeClass('tk-loading').fadeOut(600);
        }, 2500);
      }
    });//end ajax
    return false;
  }

  function insertCommentReply_TK(post_id, comment_id, num_comments) {
    var link_show_comments = $('#tk-link-' + post_id);
    var comment_form = $('#commentform-' + post_id);
    var status = $('#tk-comment-status-' + post_id);
    var item_comment = $('#tk-item-comment-' + comment_id);
    var form_data = comment_form.serialize();//obtenemos los datos

    $.ajax({
      type: 'post',
      method: 'post',
      url: comment_form.attr('action'),
      data: form_data,
      beforeSend: function () {
        status.addClass('tk-loading').html('<span class="lfo-loading"></span>').show();
      },
      success: function (data, textStatus) {
        cc('success data', data)
        status.removeClass('tk-loading').html('');
        if (data != "error") {
          status.html('<p class="tk-ajax-success">' + TK.thanksReplyComment + '</p>');
          if (link_show_comments.find('span').length) {
            num_comments = parseInt(num_comments, 10) + 1;
            link_show_comments.find('span').html(num_comments);
          }
          if (!item_comment.find('ul').length) {
            item_comment.append('<ul class="children"></ul>');
          }
          //Agregamos el nuevo comentario a la lista
          item_comment.find('ul').append(data);

          //scroll
          setTimeout(function () {
            scrollThis_TK(item_comment.find('ul li').last());
          }, 1000);
        }
        else {
          status.html('<p class="tk-ajax-error">Error in processing your form.</p>');
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        status.html('<p class="tk-ajax-error" >' + TK.duplicateComment + '</p>');
      },
      complete: function (jqXHR, textStatus) {
        setTimeout(function () {
          status.removeClass('tk-loading').fadeOut(600);
        }, 2500);
      }
    });//end ajax
    return false;

  }

  function editComment_TK(post_id, comment_id) {
    var form = $("#commentform-" + post_id);
    var status = $('#tk-comment-status-' + post_id);
    jQuery.ajax({
      type: "POST",
      //dataType: "html",
      url: TK.ajaxurl,
      data: {
        action: 'edit_comment_tk',
        post_id: post_id,
        comment_id: comment_id,
        comment_content: form.find('.tk-textarea').val(),
        nonce: TK.nonce
      },
      beforeSend: function () {
        status.addClass('tk-loading').html('<span class="lfo-loading"></span>').show();
      },
      success: function (result) {
        status.removeClass('tk-loading').html('');
        var data = jQuery.parseJSON(result);
        if (data.ok === true) {
          $('#tk-comment-' + comment_id).find('.tk-comment-text').html(data.comment_text);
          //scroll
          setTimeout(function () {
            scrollThis_TK($('#tk-comment-' + comment_id));
          }, 1000);
        }
        else {
          console.log("Errors: " + data.error);
        }
      },//end success
      complete: function (jqXHR, textStatus) {
        setTimeout(function () {
          status.removeClass('tk-loading').fadeOut(600);
        }, 2500);
      }
    });//end jQuery.ajax
    return false;
  }

  function getCommentText_TK(post_id, comment_id) {
    var form = $("#commentform-" + post_id);
    var status = $('#tk-comment-status-' + post_id);
    jQuery.ajax({
      type: "POST",
      dataType: "html",
      url: TK.ajaxurl,
      data: {
        action: 'get_comment_text_tk',
        post_id: post_id,
        comment_id: comment_id,
        nonce: TK.nonce
      },
      beforeSend: function () {
        //status.addClass('tk-loading').html('<span class="lfo-loading"></span>').show();
      },
      success: function (data) {
        //status.removeClass('tk-loading').html('');
        if (data !== 'tk-error') {
          $('#tk-textarea-' + post_id).val(data);
          autosize.update($('#tk-textarea-' + post_id));
          //$('#commentform-'+post_id).find('input[name="submit"]').hide();
          $('#commentform-' + post_id).find('input.tk-cancel-btn').show();
        }
        else {

        }
      },//end success
      complete: function (jqXHR, textStatus) {
        //setTimeout(function(){
        //status.removeClass('tk-loading').hide();
        //},2500);
      }
    });//end jQuery.ajax
    return false;
  }//end function


  function deleteComment_TK(post_id, comment_id) {
    jQuery.ajax({
      type: "POST",
      dataType: "html",
      url: TK.ajaxurl,
      data: {
        action: 'delete_comment_tk',
        post_id: post_id,
        comment_id: comment_id,
        nonce: TK.nonce
      },
      beforeSend: function () {
      },
      success: function (data) {
        if (data === 'ok') {
          $('#tk-item-comment-' + comment_id).remove();
        }
      }//end success
    });//end jQuery.ajax
    return false;
  }//end function

  //MOSTRAR/OCULTAR MÁS COMENTARIOS
  function toggleMoreComments($container_comments) {
    //console.log("======================= toggleMoreComments ", $container_comments.attr('id'));
    var liComments = $container_comments.find('>li.depth-1.tk-item-comment');
    liComments.each(function (index, element) {
      var ulChildren = $(this).find('> ul.children');
      if (ulChildren.length && ulChildren.find('li').length > 3) {
        ulChildren.find('li:gt(2)').css('display', 'none');
        ulChildren.append('<a href="#" class="tk-load-more-comments">' + TK_WP.textLoadMore + '</a>');
      }
    });
  }

  $(document).delegate('a.tk-load-more-comments', 'click', function (e) {
    e.preventDefault();
    $(this).parent().find('li.tk-item-comment').fadeIn("slow");
    $(this).remove();
  });

  $(document).delegate('.tk-media-btns a', 'click', function (e) {
    e.preventDefault();
    var post_id = $(this).attr('href').split('=')[1].replace('&action', '');
    var $action = $(this).attr('href').split('=')[2];
    $('body').append('<div id="tk-overlay"></div>');
    $('body').append('<div id="tk-modal"></div>');
    $modalHtml = '<div id="tk-modal-wrap"><span id="tk-modal-close"></span><div id="tk-modal-header"><h3 id="tk-modal-title">Título</h3></div><div id="tk-modal-content"><p>Hola</p></div><div id="tk-modal-footer"><a id="tk-modal-ok-' + post_id + '" class="tk-modal-ok tk-modal-btn" href="#">' + TK.accept + '</a><a class="tk-modal-cancel tk-modal-btn" href="#">' + TK.cancel + '</a></div></div>';
    $("#tk-modal").append($modalHtml).fadeIn(250);

    switch ($action) {
      case 'url':
        $('#tk-modal').removeClass().addClass('tk-modal-url');
        $('#tk-modal-title').html(TK.insertLink);
        $('#tk-modal-content').html('<input type="text" id="tk-modal-url-link" class="tk-modal-input" placeholder="' + TK_WP.textUrlLink + '"/><input type="text" id="tk-modal-text-link" class="tk-modal-input" placeholder="' + TK_WP.textToDisplay + '"/>');
        break;

      case 'image':
        $('#tk-modal').removeClass().addClass('tk-modal-image');
        $('#tk-modal-title').html(TK.insertImage);
        $('#tk-modal-content').html('<input type="text" id="tk-modal-url-image" class="tk-modal-input" placeholder="' + TK_WP.textUrlImage + '"/><div id="tk-modal-preview"></div>');
        break;

      case 'video':
        $('#tk-modal').removeClass().addClass('tk-modal-video');
        $('#tk-modal-title').html(TK.insertVideo);
        $('#tk-modal-content').html('<input type="text" id="tk-modal-url-video" class="tk-modal-input" placeholder="' + TK_WP.textUrlVideo + '"/><div id="tk-modal-preview"></div>');
        $('#tk-modal-footer').prepend('<a id="tk-modal-verifique-video" class="tk-modal-verifique tk-modal-btn" href="#">' + TK.checkVideo + '</a>');
        break;
    }
  });//
  //acción Ok
  $(document).delegate('.tk-modal-ok', 'click', function (e) {
    e.preventDefault();
    $('#tk-modal input, #tk-modal textarea').removeClass('tk-error');
    var $action = $('#tk-modal').attr('class');
    var post_id = $(this).attr('id').replace('tk-modal-ok-', '');
    switch ($action) {
      case 'tk-modal-url':
        processUrl_TK(post_id);
        break;
      case 'tk-modal-image':
        processImage_TK(post_id);
        break;
      case 'tk-modal-video':
        processVideo_TK(post_id);
        break;
    }
    autosize.update($('.tk-textarea'));
    closeModal_TK();
    return false;
  });
  //eliminamos errores
  $(document).delegate('#tk-modal input, #tk-modal textarea', 'focus', function (e) {
    $(this).removeClass('tk-error');
  });

  function processUrl_TK(post_id) {
    var $ok = true;
    var $urlField = $('#tk-modal-url-link');
    var $textField = $('#tk-modal-text-link');
    if ($urlField.val().length < 1) {
      $ok = false;
      $urlField.addClass('tk-error');
    }
    if ($textField.val().length < 1) {
      $ok = false;
      $textField.addClass('tk-error');
    }
    if ($ok) {
      var $urlVal = $urlField.val().replace(/https?:\/\//gi, '');
      var link_show_comments = '<a href="http://' + $urlVal + '" title="' + $textField.val() + '" rel="nofollow" target="_blank">' + $textField.val() + '</a>';
      insertInTextArea_TK(post_id, link_show_comments);
    }
    return false;
  }

  function processImage_TK(post_id) {
    var $ok = true;
    var $urlField = $('#tk-modal-url-image');
    if ($urlField.val().length < 1) {
      $ok = false;
      $urlField.addClass('tk-error');
    }
    if ($ok) {
      var $urlVal = $urlField.val();
      var $image = '<img src="' + $urlVal + '" />';
      insertInTextArea_TK(post_id, $image);
    }
    return false;
  }

  //vista previa de imagen
  $(document).delegate('#tk-modal-url-image', 'change', function (e) {
    setTimeout(function () {
      $('#tk-modal-preview').html('<img src="' + $('#tk-modal-url-image').val() + '" />');
    }, 200);
  });

  function processVideo_TK(post_id) {
    var $ok = true;
    var $urlField = $('#tk-modal-url-video');
    if (!$('#tk-modal-preview').find('iframe').length) {
      $ok = false;
      $('#tk-modal-preview').html('<p class="tk-modal-error">Please check the video url</p>');
    }
    if ($ok) {
      var $video = '<p>' + $('#tk-modal-preview').find('input[type="hidden"]').val() + '</p>';
      insertInTextArea_TK(post_id, $video);
    }
    return false;
  }

  //vista previa de video
  $(document).delegate('#tk-modal-verifique-video', 'click', function (e) {
    e.preventDefault();
    var $urlVideo = $('#tk-modal-url-video');
    var $urlVideoVal = $urlVideo.val().replace(/\s+/g, '');
    $urlVideo.removeClass('tk-error');
    $(this).attr('id', '');//desactivamos el enlace

    if ($urlVideoVal.length < 1) {
      $urlVideo.addClass('tk-error');
      $('.tk-modal-video').find('a.tk-modal-verifique').attr('id', 'tk-modal-verifique-video');//activamos el enlace
      return false;
    }

    var data = 'url_video=' + $urlVideoVal;
    $.ajax({
      url: TK.ajaxurl,
      data: data + '&action=verificar_video_TK',
      type: "POST",
      dataType: "html",
      beforeSend: function () {
        $('#tk-modal-preview').html('<div class="tk-loading tk-loading-2"></div>');
      },
      success: function (data) {
        if (data != 'error') {
          $('#tk-modal-preview').html(data);
        } else {
          $('#tk-modal-preview').html('<p class="tk-modal-error">Invalid video url</p>');
        }
      },
      error: function (xhr) {
        $('#tk-modal-preview').html('<p class="tk-modal-error">Failed to process, try again</p>');
      },
      complete: function (jqXHR, textStatus) {
        $('.tk-modal-video').find('a.tk-modal-verifique').attr('id', 'tk-modal-verifique-video');//activamos el enlace
      }
    });//end ajax
  });

  function closeModal_TK() {
    $('#tk-overlay, #tk-modal').remove();
    return false;
  }

  //acción cancelar
  $(document).delegate('#tk-modal-close, .tk-modal-cancel', 'click', function (e) {
    e.preventDefault();
    closeModal_TK();
    return false;
  });

  function jPages_TK(post_id, $numPerPage, $destroy) {
    //Si existe el plugin jPages y está activado
    if (typeof jQuery.fn.jPages == 'function' && TK.jpages == 'true') {
      var $idList = 'tk-container-comment-' + post_id;
      var $holder = 'div.tk-holder-' + post_id;
      var num_comments = jQuery('#' + $idList + ' > li').length;
      if (num_comments > $numPerPage) {
        if ($destroy) {
          jQuery('#' + $idList).children().removeClass('animated jp-hidden');
        }
        jQuery($holder).jPages({
          containerID: $idList,
          previous: "← " + TK_WP.textNavPrev,
          next: TK_WP.textNavNext + " →",
          perPage: parseInt($numPerPage, 10),
          minHeight: false,
          keyBrowse: true,
          direction: "forward",
          animation: "fadeIn",
        });
      }//end if
    }//end if
    return false;
  }

  function captcha_TK($max) {
    if (!$max) $max = 5;
    return {
      n1: Math.floor(Math.random() * $max + 1),
      n2: Math.floor(Math.random() * $max + 1),
    };
  }

  function scrollThis_TK($this) {
    if ($this.length) {
      var $position = $this.offset().top;
      var $scrollThis = Math.abs($position - 200);
      $('html,body').animate({ scrollTop: $scrollThis }, 'slow');
    }
    return false;
  }

  function getUrlVars_TK(url) {
    var query = url.substring(url.indexOf('?') + 1);
    var parts = query.split("&");
    var params = {};
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].split("=");
      params[pair[0]] = pair[1];
    }
    return params;
  }

  function cancelCommentAction_TK(post_id) {
    $('form#commentform-' + post_id).find('[name="comment_parent"]').val('0');
    $('form#commentform-' + post_id).find('.tk-textarea').val('').attr('placeholder', TK.textWriteComment);
    $('form#commentform-' + post_id).find('input[name="submit"]').removeClass();
    $('form#commentform-' + post_id).find('input.tk-cancel-btn').hide();
    autosize.update($('#tk-textarea-' + post_id));
    $('input, textarea').removeClass('tk-error');
    captchaValues = captcha_TK(9);
    $('.tk-captcha-text').html(captchaValues.n1 + ' &#43; ' + captchaValues.n2 + ' = ');
  }

  function restoreIframeHeight(wrapper) {
    var widthWrapper = TK.widthWrap ? parseInt(TK.widthWrap, 10) : wrapper.outerWidth();
    // if(widthWrapper >= 321 ) {
    // 	wrapper.find('iframe').attr('height','250px');
    // } else {
    // 	wrapper.find('iframe').attr('height','160px');
    // }
  }

  function rezizeBoxComments_TK(wrapper) {
    var widthWrapper = TK.widthWrap ? parseInt(TK.widthWrap, 10) : wrapper.outerWidth();
    if (widthWrapper <= 480) {
      wrapper.addClass('tk-full');
    } else {
      wrapper.removeClass('tk-full');
    }
  }

  function insertInTextArea_TK(post_id, $value) {
    //Get textArea HTML control
    var $fieldID = document.getElementById('tk-textarea-' + post_id);

    //IE
    if (document.selection) {
      $fieldID.focus();
      var sel = document.selection.createRange();
      sel.text = $value;
      return;
    }
    //Firefox, chrome, mozilla
    else if ($fieldID.selectionStart || $fieldID.selectionStart == '0') {
      var startPos = $fieldID.selectionStart;
      var endPos = $fieldID.selectionEnd;
      var scrollTop = $fieldID.scrollTop;
      $fieldID.value = $fieldID.value.substring(0, startPos) + $value + $fieldID.value.substring(endPos, $fieldID.value.length);
      $fieldID.focus();
      $fieldID.selectionStart = startPos + $value.length;
      $fieldID.selectionEnd = startPos + $value.length;
      $fieldID.scrollTop = scrollTop;
    }
    else {
      $fieldID.value += textArea.value;
      $fieldID.focus();
    }
  }

  // LIKE COMMENTS
  $(document).delegate('a.tk-rating-link', 'click', function (e) {
    e.preventDefault();
    var comment_id = $(this).attr('href').split('=')[1].replace('&method', '');
    var $method = $(this).attr('href').split('=')[2];
    commentRating_TK(comment_id, $method);
    return false;
  });

  function commentRating_TK(comment_id, $method) {
    var $ratingCount = $('#tk-comment-' + comment_id).find('.tk-rating-count');
    var $currentLikes = $ratingCount.text();
    jQuery.ajax({
      type: 'POST',
      url: TK.ajaxurl,
      data: {
        action: 'comment_rating',
        comment_id: comment_id,
        method: $method,
        nonce: TK.nonce
      },
      beforeSend: function () {
        $ratingCount.html('').addClass('lfo-loading');
      },
      success: function (result) {
        var data = $.parseJSON(result);
        if (data.success === true) {
          $ratingCount.html(data.likes).attr('title', data.likes + ' ' + TK_WP.textLikes);
          if (data.likes < 0) {
            $ratingCount.removeClass().addClass('tk-rating-count tk-rating-negative');
          }
          else if (data.likes > 0) {
            $ratingCount.removeClass().addClass('tk-rating-count tk-rating-positive');
          }
          else {
            $ratingCount.removeClass().addClass('tk-rating-count tk-rating-neutral');
          }
        } else {
          $ratingCount.html($currentLikes);
        }
      },
      error: function (xhr) {
        $ratingCount.html($currentLikes);
      },
      complete: function (data) {
        $ratingCount.removeClass('lfo-loading');
      }//end success

    });//end jQuery.ajax
  }

  function clog(msg) {
    console.log(msg);
  }

  function cc(msg, msg2) {
    console.log(msg, msg2);
  }

  // show and hide note
    $(document).delegate('a.tk_note_button','click',function (e) {
        e.preventDefault();
       var note_area = $(this).closest('.tk-select-attending').find('.tk_note_texarea');
        note_area.toggleClass('active');
    })
});//end ready


function gotoTop() {
    var elmnt = document.getElementById("tk-box");
    elmnt.scrollTop = 0;
}


jQuery("document").ready(function() {
  // var iHeight = $("#tk-box").height();
  // $(this).addClass("jp-show");
  // $(this).removeClass("jp-hidden");

  // $('.li').removeClass('jp-hidden');
  // $('.li').addClass("jp-show");

 jQuery('.tk-container-comments li.comment').addClass('jp-show');
  // $(this).parent().addClass('jp-hidden');

 



  // var msg = 'DIV height is :<b> ' + iHeight + 'px</b> and ScrollHeight is :<b>' + iScrollHeight + 'px</b>';

  // $("span").html(msg);

});
