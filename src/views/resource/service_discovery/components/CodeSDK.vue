<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <BasePanel v-model="state.panel" icon="mdi-wrench" :title="i18nLocal.t('tip.sdk_demo')">
    <template #content>
      <v-card class="conf rounded-0 pa-0" flat>
        <v-card-text class="text-h5 card__title">
          <v-form class="pa-0" lazy-validation @submit.prevent>
            <v-row>
              <v-col cols="12">
                <v-radio-group v-model="sdk" hide-details row>
                  <v-radio v-for="(t, index) in sdkItems" :key="index" :label="t.text" :value="t.value" />
                </v-radio-group>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <ACEEditor
          v-model="sdkContent"
          :class="`rounded-0 clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
          :lang="lang"
          :options="{
            tabSize: 2,
            fontSize: 12,
            printMarginColumn: 100,
            showPrintMargin: false,
            wrap: true,
            readOnly: true,
          }"
          :style="{ height: `${height}px !important` }"
          @keydown.stop
        />
      </v-card>
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, reactive, ref, watch } from 'vue';

  import { useI18n } from '../i18n';
  import { useStore } from '@/store';

  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    panel: false,
  });

  const sdk = ref<string>('java');
  const sdkItems = [
    { text: 'java', value: 'java', lang: 'java' },
    { text: 'spring', value: 'spring', lang: 'java' },
    { text: 'springboot', value: 'springboot', lang: 'java' },
    { text: 'spring cloud', value: 'springcloud', lang: 'java' },
    { text: 'c#', value: 'c_sharp', lang: 'c_sharp' },
  ];
  const sdkContent = ref<string>('');

  const lang: ComputedRef<string> = computed(() => {
    return sdkItems.find((s) => {
      return s.value === sdk.value;
    }).lang;
  });

  const height: ComputedRef<number> = computed(() => {
    return window.innerHeight - 120 * store.state.Scale - 1;
  });

  const open = (): void => {
    state.panel = true;
  };

  defineExpose({
    open,
  });

  watch(
    () => sdk,
    async (newValue) => {
      if (!newValue.value) return;
      switch (newValue.value) {
        case 'java':
          sdkContent.value =
            `/* Refer to document: https://github.com/alibaba/nacos/blob/master/example/src/main/java/com/alibaba/nacos/example
    *  pom.xml
        <dependency>
            <groupId>com.alibaba.nacos</groupId>
            <artifactId>nacos-client</artifactId>
            <version>` +
            '${latest.version}' +
            `</version>
        </dependency>
    */
    package com.alibaba.nacos.example;

    import java.util.Properties;

    import com.alibaba.nacos.api.exception.NacosException;
    import com.alibaba.nacos.api.naming.NamingFactory;
    import com.alibaba.nacos.api.naming.NamingService;
    import com.alibaba.nacos.api.naming.listener.Event;
    import com.alibaba.nacos.api.naming.listener.EventListener;
    import com.alibaba.nacos.api.naming.listener.NamingEvent;

    /**
     * @author nkorange
     */
    public class NamingExample {

        public static void main(String[] args) throws NacosException {

            Properties properties = new Properties();
            properties.setProperty("serverAddr", System.getProperty("serverAddr"));
            properties.setProperty("namespace", System.getProperty("namespace"));

            NamingService naming = NamingFactory.createNamingService(properties);

            naming.registerInstance("test", "11.11.11.11", 8888, "TEST1");

            naming.registerInstance("test", "2.2.2.2", 9999, "DEFAULT");

            System.out.println(naming.getAllInstances("test"));

            naming.deregisterInstance("test", "2.2.2.2", 9999, "DEFAULT");

            System.out.println(naming.getAllInstances("test"));

            naming.subscribe("test", new EventListener() {
                @Override
                public void onEvent(Event event) {
                    System.out.println(((NamingEvent)event).getServiceName());
                    System.out.println(((NamingEvent)event).getInstances());
                }
            });
        }
    }`;
          break;
        case 'spring':
          sdkContent.value =
            `/* Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-example/nacos-spring-discovery-example
    *  pom.xml
        <dependency>
            <groupId>com.alibaba.nacos</groupId>
            <artifactId>nacos-spring-context</artifactId>
            <version>` +
            '${latest.version}' +
            `</version>
        </dependency>
    */

    // Refer to document:  https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-example/nacos-spring-discovery-example/src/main/java/com/alibaba/nacos/example/spring
    package com.alibaba.nacos.example.spring;

    import com.alibaba.nacos.api.annotation.NacosProperties;
    import com.alibaba.nacos.spring.context.annotation.discovery.EnableNacosDiscovery;
    import org.springframework.context.annotation.Configuration;

    @Configuration
    @EnableNacosDiscovery(globalProperties = @NacosProperties(serverAddr = "127.0.0.1:8848"))
    public class NacosConfiguration {

    }

    // Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-example/nacos-spring-discovery-example/src/main/java/com/alibaba/nacos/example/spring/controller
    package com.alibaba.nacos.example.spring.controller;

    import com.alibaba.nacos.api.annotation.NacosInjected;
    import com.alibaba.nacos.api.exception.NacosException;
    import com.alibaba.nacos.api.naming.NamingService;
    import com.alibaba.nacos.api.naming.pojo.Instance;
    import org.springframework.stereotype.Controller;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RequestParam;
    import org.springframework.web.bind.annotation.ResponseBody;

    import java.util.List;

    import static org.springframework.web.bind.annotation.RequestMethod.GET;

    @Controller
    @RequestMapping("discovery")
    public class DiscoveryController {

        @NacosInjected
        private NamingService namingService;

        @RequestMapping(value = "/get", method = GET)
        @ResponseBody
        public List<Instance> get(@RequestParam String serviceName) throws NacosException {
            return namingService.getAllInstances(serviceName);
        }
    }`;
          break;
        case 'springboot':
          sdkContent.value =
            `/* Refer to document: https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-boot-example/nacos-spring-boot-discovery-example
    *  pom.xml
        <dependency>
           <groupId>com.alibaba.boot</groupId>
           <artifactId>nacos-discovery-spring-boot-starter</artifactId>
           <version>` +
            '${latest.version}' +
            `</version>
        </dependency>
    */
    /* Refer to document:  https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-boot-example/nacos-spring-boot-discovery-example/src/main/resources
    * application.properties
       nacos.discovery.server-addr=127.0.0.1:8848
    */
    // Refer to document: https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-boot-example/nacos-spring-boot-discovery-example/src/main/java/com/alibaba/nacos/example/spring/boot/controller

    package com.alibaba.nacos.example.spring.boot.controller;

    import com.alibaba.nacos.api.annotation.NacosInjected;
    import com.alibaba.nacos.api.exception.NacosException;
    import com.alibaba.nacos.api.naming.NamingService;
    import com.alibaba.nacos.api.naming.pojo.Instance;
    import org.springframework.stereotype.Controller;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RequestParam;
    import org.springframework.web.bind.annotation.ResponseBody;

    import java.util.List;

    import static org.springframework.web.bind.annotation.RequestMethod.GET;

    @Controller
    @RequestMapping("discovery")
    public class DiscoveryController {

        @NacosInjected
        private NamingService namingService;

        @RequestMapping(value = "/get", method = GET)
        @ResponseBody
        public List<Instance> get(@RequestParam String serviceName) throws NacosException {
            return namingService.getAllInstances(serviceName);
        }
    }`;
          break;
        case 'springcloud':
          sdkContent.value =
            `/* Refer to document: https://github.com/nacos-group/nacos-examples/blob/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/
*  pom.xml
    <dependency>
       <groupId>org.springframework.cloud</groupId>
       <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
       <version>` +
            '${latest.version}' +
            `</version>
    </dependency>
*/

// nacos-spring-cloud-provider-example

/* Refer to document:  https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/nacos-spring-cloud-provider-example/src/main/resources
* application.properties
server.port=18080
spring.application.name=test
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
*/

// Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/nacos-spring-cloud-provider-example/src/main/java/com/alibaba/nacos/example/spring/cloud
package com.alibaba.nacos.example.spring.cloud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author xiaojing
 */
@SpringBootApplication
@EnableDiscoveryClient
public class NacosProviderApplication {

  public static void main(String[] args) {
    SpringApplication.run(NacosProviderApplication.class, args);
}

  @RestController
  class EchoController {
    @RequestMapping(value = "/echo/{string}", method = RequestMethod.GET)
    public String echo(@PathVariable String string) {
      return "Hello Nacos Discovery " + string;
    }
  }
}

// nacos-spring-cloud-consumer-example

/* Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/nacos-spring-cloud-consumer-example/src/main/resources
* application.properties
spring.application.name=micro-service-oauth2
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
*/

// Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-discovery-example/nacos-spring-cloud-consumer-example/src/main/java/com/alibaba/nacos/example/spring/cloud
package com.alibaba.nacos.example.spring.cloud;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

/**
 * @author xiaojing
 */
@SpringBootApplication
@EnableDiscoveryClient
public class NacosConsumerApplication {

    @LoadBalanced
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public static void main(String[] args) {
        SpringApplication.run(NacosConsumerApplication.class, args);
    }

    @RestController
    public class TestController {

        private final RestTemplate restTemplate;

        @Autowired
        public TestController(RestTemplate restTemplate) {this.restTemplate = restTemplate;}

        @RequestMapping(value = "/echo/{str}", method = RequestMethod.GET)
        public String echo(@PathVariable String str) {
            return restTemplate.getForObject("http://service-provider/echo/" + str, String.class);
        }
    }
}`;
          break;
        case 'c_sharp':
          sdkContent.value =
            `/* Refer to document: https://github.com/nacos-group/nacos-sdk-csharp/
  Demo for Basic Nacos Opreation
  App.csproj

  <ItemGroup>
    <PackageReference Include="nacos-sdk-csharp" Version="` +
            '${latest.version}' +
            `" />
  </ItemGroup>
  */

  using Microsoft.Extensions.DependencyInjection;
  using Nacos.V2;
  using Nacos.V2.DependencyInjection;
  using System;
  using System.Collections.Generic;
  using System.Threading.Tasks;

  class Program
  {
      static async Task Main(string[] args)
      {
          IServiceCollection services = new ServiceCollection();

          services.AddNacosV2Naming(x =>
          {
              x.ServerAddresses = new List<string> { "http://localhost:8848/" };
              x.Namespace = "cs-test";

              // swich to use http or rpc
              x.NamingUseRpc = true;
          });

          IServiceProvider serviceProvider = services.BuildServiceProvider();
          var namingSvc = serviceProvider.GetService<INacosNamingService>();

          await namingSvc.RegisterInstance("test", "11.11.11.11", 8888, "TEST1");

          await namingSvc.RegisterInstance("test", "2.2.2.2", 9999, "DEFAULT");

          Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(await namingSvc.GetAllInstances("test")));

          await namingSvc.DeregisterInstance("test", "2.2.2.2", 9999, "DEFAULT");

          var listener = new EventListener();

          await namingSvc.Subscribe("test", listener);
      }

      internal class EventListener : IEventListener
      {
          public Task OnEvent(IEvent @event)
          {
              Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(@event));
              return Task.CompletedTask;
          }
      }
  }

  /* Refer to document: https://github.com/nacos-group/nacos-sdk-csharp/
  Demo for ASP.NET Core Integration
  App.csproj

  <ItemGroup>
    <PackageReference Include="nacos-sdk-csharp.AspNetCore" Version=` +
            '"${latest.version}"' +
            ` />
  </ItemGroup>
  */

  /* Refer to document: https://github.com/nacos-group/nacos-sdk-csharp/blob/dev/samples/App1/appsettings.json
  *  appsettings.json
  {
    "nacos": {
      "ServerAddresses": [ "http://localhost:8848" ],
      "DefaultTimeOut": 15000,
      "Namespace": "cs",
      "ServiceName": "App1",
      "GroupName": "DEFAULT_GROUP",
      "ClusterName": "DEFAULT",
      "Port": 0,
      "Weight": 100,
      "RegisterEnabled": true,
      "InstanceEnabled": true,
      "Ephemeral": true,
      "NamingUseRpc": true,
      "NamingLoadCacheAtStart": ""
    }
  }
  */

  // Refer to document: https://github.com/nacos-group/nacos-sdk-csharp/blob/dev/samples/App1/Startup.cs
  using Nacos.AspNetCore.V2;

  public class Startup
  {
      public Startup(IConfiguration configuration)
      {
          Configuration = configuration;
      }

      public IConfiguration Configuration { get; }

      public void ConfigureServices(IServiceCollection services)
      {
          // ....
          services.AddNacosAspNet(Configuration);
      }

      public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
      {
          // ....
      }
  }
      `;
          break;
      }
    },
    { immediate: true, deep: true },
  );
</script>

<style lang="scss" scoped>
  .conf {
    background-color: #f6f6f6;
  }
</style>
