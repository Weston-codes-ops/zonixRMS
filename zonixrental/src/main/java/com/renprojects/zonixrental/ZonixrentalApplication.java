package com.renprojects.zonixrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZonixrentalApplication {

	public static void main(String[] args) {
		SpringApplication.run(ZonixrentalApplication.class, args);
	}

}
