package com.netcinema.SB.MongoDB;

import org.springframework.boot.SpringApplication;

public class TestApplication {

	public static void main(String[] args) {
		SpringApplication.from(NetCinemaApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
