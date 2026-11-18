package com.pro.nit.Service;

import com.pro.nit.DTO.PageResponse;
import com.pro.nit.DTO.RequestCategory;
import com.pro.nit.DTO.ResponseCategory;
import com.pro.nit.Entity.Category;
import com.pro.nit.Exception.ResourceNotFoundException;
import com.pro.nit.Mapper.CategoryMapper;
import com.pro.nit.Repository.CategoryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    // 🟢 1. Save Category (បង្កើតថ្មី)
    public ResponseCategory save(RequestCategory dto) {
        Category category = categoryMapper.toEntity(dto);
        Category savedCategory = this.categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }
    public List<ResponseCategory> getList() {
        return this.categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }
    public PageResponse<ResponseCategory> filter(Long id, String name, Boolean status, String code, LocalDateTime startDate, LocalDateTime endDate, String sortBy, String sortAs, Integer page, Integer size){
        Specification<Category> spec = Specification.unrestricted();
        if (id !=null){
            spec = spec.and((root, query, cb) ->
                            cb.equal(root.get("id"),id)
                    );
        }
        if (name !=null && !name.isEmpty()){
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("name")),"%"+name.toLowerCase()+"%")
            );
        }
        if (status !=null ){
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("status"),status)
            );
        }
        if (code !=null && !name.isEmpty()){
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("code")),"%"+code.toLowerCase()+"%")
            );
        }
        if (startDate != null && endDate != null){
            spec = spec.and((root, query, cb) ->
                    cb.between(root.get("createdAt"), startDate,endDate)
                    );
        }

        List<String> allowSort = List.of("id", "name","code","createdAt");
        Sort sort = Sort.by(Sort.Order.desc("id"));
//        Sort sort = Sort.unsorted();
        if (sortBy !=null && sortAs != null && allowSort.contains(sortBy)){
            sort = sortAs.equalsIgnoreCase("desc") ? Sort.by(Sort.Order.desc("id")) : Sort.by(Sort.Order.asc(sortBy));
        }

        Pageable pageable = PageRequest.of(page-1,size,sort);
        Page<Category> pageCategory = this.categoryRepository.findAll(spec,pageable);
        return PageResponse.from(pageCategory,this.categoryMapper::toResponse);
//        Page<ResponseCategory> pageResponse = pageMapper.setFirst();
    }

    // 🟢 3. Get Category by ID (ទាញយកតាម ID)
    public ResponseCategory  findById(Long id) {
        Category category = this.categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponse(category);
    }
//
    // 🟢 4. Update Category (កែប្រែទិន្នន័យ)
    public ResponseCategory update(@PathVariable long id, @Valid RequestCategory dto){
        Category category = this.categoryRepository.findById(id)
                .orElseThrow(() -> new  ResourceNotFoundException("Category not found"));
        category.setName(dto.getName());
        category.setCode(dto.getCode());
        category.setDescription(dto.getDescription());
        Category newCategory = this.categoryRepository.save(category);
        return this.categoryMapper.toResponse(newCategory);
    }
    // 🟢 5. Delete Category (លុបទិន្នន័យ)
    public void delete(Long id) {
        this.categoryRepository.findById(id)
                .orElseThrow(() -> new  ResourceNotFoundException("Category not found"));
        this.categoryRepository.deleteById(id);
//        if (!categoryRepository.existsById(id)) {
//            throw new RuntimeException("Category not found with id: " + id);
//        }
//        categoryRepository.deleteById(id);
    }

}