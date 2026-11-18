package com.pro.nit.Controller;

import com.pro.nit.DTO.PageResponse;
import com.pro.nit.DTO.RequestCategory;
import com.pro.nit.DTO.ResponseCategory;
import com.pro.nit.Entity.Category;
import com.pro.nit.Service.CategoryService;
import com.pro.nit.Util.ApiResponse;
import jakarta.persistence.Id;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

//    @PostMapping
//    public ResponseEntity<ResponseCategory> create(@RequestBody RequestCategory dto) {
//        return ResponseEntity.ok(this.categoryService.save(dto));
//    }

//    @PostMapping
//    ResponseEntity<Map<String, Object>> create(@RequestBody RequestCategory dto){
//        Map<String, Object> res = new HashMap<>();
//        res.put("success", true);
//        res.put("code", HttpStatus.CREATED.value());
//        res.put("message", "create success");
//        res.put("data", this.categoryService.save(dto));
//        res.put("error", null);
//        return ResponseEntity.status(HttpStatus.CREATED.value()).body(res);
//    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResponseCategory>> create(@Valid @RequestBody RequestCategory  dto){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.create(this.categoryService.save(dto),"Category create Successfully ! "));
    }
    @GetMapping
    public ResponseEntity<ApiResponse<List<ResponseCategory>>> getList(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.OK(this.categoryService.getList()));
    }
    @GetMapping("/filter")
    ResponseEntity<ApiResponse<PageResponse<ResponseCategory>>> filter(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortAs,
            @RequestParam(required = false,defaultValue = "1") Integer page,
            @RequestParam(required = false,defaultValue = "5") Integer size
            ){
        PageResponse<ResponseCategory> pageResponse = this.categoryService.filter(id,name,status,code,startDate,endDate,sortBy,sortAs,page,size);
//        Page<Category> categories = (Page<Category>) filterCategories.get("data");
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.OK(pageResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResponseCategory>> getById(@PathVariable long id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.OK(this.categoryService.findById(id)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResponseCategory>> update(@PathVariable long id, @Valid @RequestBody RequestCategory dto) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.OK(this.categoryService.update(id, dto)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable long id){
        this.categoryService.delete(id);
                return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.OK(null, "delete category successfully"));
    }
}

//package com.pro.nit.Controller;
//
//import com.pro.nit.DTO.RequestCategory;
//import com.pro.nit.DTO.ResponseCategory;
//import com.pro.nit.Service.CategoryService;
//import jakarta.persistence.Entity;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/categories")
//public class CategoryController {
//     final private CategoryService categoryService;
//    @PostMapping
//    public ResponseEntity<ResponseCategory> create(@RequestBody RequestCategory dto){
//        return ResponseEntity.ok(this.categoryService.save(dto));
//    }
//}
