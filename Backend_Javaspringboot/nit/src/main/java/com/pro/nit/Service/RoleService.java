
package com.pro.nit.Service;

import com.pro.nit.Entity.Role;
import com.pro.nit.Repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public List<Role> getList() {
        return roleRepository.findAll();
    }

    public Role getOneById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Role not found with id: " + id));
    }

    public Role create(Role role) {
        return roleRepository.save(role);
    }

    public Role update(Long id, Role role) {
        Role existingRole = getOneById(id);

        existingRole.setName(role.getName());
        existingRole.setCode(role.getCode());
        existingRole.setStatus(role.getStatus());

        if (role.getPermissions() != null) {
            existingRole.setPermissions(role.getPermissions());
        }

        return roleRepository.save(existingRole);
    }

    public void delete(Long id) {
        Role existingRole = getOneById(id);
        roleRepository.delete(existingRole);
    }
}
