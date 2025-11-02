package com.ra.areaservice.controller.admin;

import com.ra.areaservice.exception.CustomException;
import com.ra.areaservice.model.dto.req.AreaRequestDTO;
import com.ra.areaservice.model.entity.Areas;
import com.ra.areaservice.security.annotation.RequireRole;
import com.ra.areaservice.service.IAreaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/areas")
@RequiredArgsConstructor
public class AAreaController {
    private  final IAreaService areaService;

    @GetMapping("/test")
    public String test(HttpServletRequest request) {
        String email = request.getHeader("X-User-Email");
        String roles = request.getHeader("X-User-Role");

        return "Request từ user: " + email + " | Roles: " + roles;
    }

    // API lấy toàn bộ khu vực không phân trang
    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/findAll")
    public ResponseEntity<List<Areas>> getAllAreas() {
        List<Areas> areas = areaService.findAll();
        return ResponseEntity.ok(areas);
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/{areaId}")
    public ResponseEntity<?> getAreaById(@PathVariable Long areaId) {
        try {
            Areas area = areaService.findById(areaId);
            return ResponseEntity.ok(area);
        } catch (CustomException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PostMapping
    public  ResponseEntity<?> addNewArea(@Valid @RequestBody AreaRequestDTO areaRequestDTO){
        try {
            return ResponseEntity.created(URI.create("/api/v1/admin/areas"))
                    .body(areaService.save(areaRequestDTO));
        }catch (CustomException ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PutMapping("/{areaId}")
    public ResponseEntity<?> updateArea(
            @Valid @RequestBody AreaRequestDTO areaRequestDTO,
            @PathVariable Long areaId)
    {
        try {
            return ResponseEntity.ok().body(areaService.update(areaRequestDTO, areaId));
        }catch (CustomException ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }catch (Exception e) {
            // Xử lý các ngoại lệ khác nếu có
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi trong quá trình xử lý: " + e.getMessage());
        }
    }
}
