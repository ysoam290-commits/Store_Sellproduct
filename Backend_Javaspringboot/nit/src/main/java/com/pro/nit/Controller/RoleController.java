
package com.pro.nit.Controller;

import com.pro.nit.Entity.Role;
import com.pro.nit.Service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getList() {
        List<Role> roles = roleService.getList();

        Map<String, Object> response = new HashMap<>();
        response.put("total", roles.size());
        response.put("list", roles);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> getOne(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(roleService.getOneById(id));
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Role> create(@RequestBody Role role) {
        Role created = roleService.create(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> update(
            @PathVariable Long id,
            @RequestBody Role role) {
        return ResponseEntity.ok(roleService.update(id, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.ok("Deleted successfully!");
    }
}
