package com.pro.nit.Util;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.SimpleTimeZone;
import java.util.TreeMap;

@Setter
@Getter
public class ApiResponse<T> {
    private Boolean success;
    private Integer code;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public ApiResponse(Boolean success, Integer code, String message, T data) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(){
        this.timestamp = LocalDateTime.now();
    }
    public static <T> ApiResponse <T> create(T data){
        return new ApiResponse <> (true, HttpStatus.CREATED.value(),"Create Success",data);
    }
    public static <T> ApiResponse <T> create(T data, String message){
        return new ApiResponse <> (true, HttpStatus.CREATED.value(),message,data);
    }
    public static <T> ApiResponse <T> OK(T data){
        return new ApiResponse <> (true, HttpStatus.OK.value(),"Success",data);
    }
    public static <T> ApiResponse <T> OK(T data, String message){
        return new ApiResponse <> (true, HttpStatus.OK.value(),message,data);
    }
//    public static <T> ApiResponse <T> success(T data, String message){
//        return new ApiResponse <> (true, HttpStatus.OK.value(),message,data);
//    }
    public static <T> ApiResponse <T> error(T data, String message ,Integer status){
        return new ApiResponse <> (false, status ,message,data);
    }
    public static <T> ApiResponse <T> error(String message , HttpStatus status){
        return new ApiResponse <> (false, status.value(),message,null);
    }

    public static <T> ApiResponse <T> error(T data,  String message , HttpStatus status){
        return new ApiResponse <> (false, status.value(),message,data);
    }
}
