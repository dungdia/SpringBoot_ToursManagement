
[//]: # (Tạo network để các container có thể giao tiếp với nhau)
docker network create spring-cloud-net

[//]: # (Kiểm tra các network đã tạo)
docker network ls

[//]: # (Kết quả trả về sẽ tương tự như bên dưới , không phải lệnh mà là kết quả trả về của docker network ls)
NETWORK ID     NAME              DRIVER    SCOPE
ab12cd34ef56   spring-cloud-net  bridge    local

[//]: # (Kiểm tra chi tiết network đã tạo)
docker network inspect spring-cloud-net

[//]: # (Kết quả trả về sẽ tương tự như bên dưới , không phải lệnh mà là kết quả trả về của docker network inspect spring-cloud-net)
"eureka-service-1"
"eureka-service-2"
"api-gateway"
"user-service"


[//]: # (Chạy tất cả các container trong file docker-compose.yml, xóa container cũ và build lại image mới)
[//]: # (Nếu bạn muốn build lại image và chạy container với code mới, dùng lệnh này)
docker-compose up -d --build --force-recreate

[//]: # (Cần chạy lệnh này để build lại docker image và chạy container và code mới)
docker-compose up -d --build

[//]: # (Chỉ cần chạy lệnh này để chạy container với code đã build sẵn)
docker-compose up -d

[//]: # (Nếu bạn muốn build lại image từ đầu, không dùng cache)
docker-compose build --no-cache

[//]: # (Dừng và xóa container khi không sử dụng nữa)
docker-compose down

[//]: # (Kiểm tra các container đang chạy)
docker ps -a

[//]: # (1. Kết nối vào container mysql)
docker exec -it user-service bash

[//]: # (2. Kết nối vào mysql prompt, cài 1 lần thôi) 
apt-get update && apt-get install -y curl 

[//]: # (3. Kiểm tra kết nối từ container đến mysql server)
curl host.docker.internal:3306

[//]: # (4. Gõ lệnh 'exit' để thoát khỏi mysql prompt)
exit

[//]: # (1.1 Cài đặt mariadb-client trong container , cài 1 lần thôi)
apt update && apt install -y mariadb-client

[//]: # (1.2 Kết nối vào mysql prompt)
SHOW DATABASES;
USE j2ee_user_service;
SHOW TABLES;
SELECT * FROM users;



[//]: # (Lệnh xem log của container)
docker logs api-gateway






