package org.example.service;

import org.example.entity.Department;
import org.example.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    private final DepartmentRepository repo;

    public DepartmentService(DepartmentRepository repo) {
        this.repo = repo;
    }

    public Department create(Department d) {
        d.setId(null); // force insert
        return repo.save(d);
    }

    public List<Department> getAll() {
        return repo.findAll();
    }

    public Department getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Department not found: " + id));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new RuntimeException("Department not found: " + id);
        repo.deleteById(id);
    }
}
