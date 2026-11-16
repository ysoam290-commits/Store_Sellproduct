package com.pro.nit.Exception;


import com.pro.nit.Util.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalException {
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage(), HttpStatus.FORBIDDEN));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<?>> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        return ResponseEntity.status(status)
                .body(ApiResponse.error(ex.getReason(), status));
    }

    //404
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleNotFoundException(ResourceNotFoundException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage(), HttpStatus.NOT_FOUND));
    }

    //400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException exe){
        Map<String, String> errors = new HashMap<>();
        exe.getBindingResult().getFieldErrors().forEach(item ->
//                      item.getDefaultMessage()
                errors.put(item.getField(), item.getDefaultMessage())
                );

        Map<String, Object> res = new HashMap<>();
        res.put("success", false);
        res.put("code", HttpStatus.BAD_REQUEST.value());
        res.put("message", "Validaton fails");
        res.put("data", null);
        res.put("timestamp", LocalDateTime.now());
        res.put("error", errors);
//        this.success = success;
//        this.code = code;
//        this.message = message;
//        this.data = data;
//        this.timestamp = LocalDateTime.now();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }


    @ExceptionHandler(Exception.class)
//    public ResponseEntity<?> handleException(Exception ex){
//        Map<String, Object> res = new HashMap<>();
//            res.put("success", false);
//            res.put("code",500);
//            res.put("message","something wrong");
//         log error
//         res.put("message", ex.getMessage());
//
//            res.put("data", null);
//            res.put("timestamp", LocalDateTime.now());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
//
//    }




    public ResponseEntity<ApiResponse > handleException(Exception ex){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));

    }
}
