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
  <ContainerLog ref="containerLog" />
</template>

<script>
  import { getPodDetail } from '@kubegems/api/direct';
  import ContainerLog from '@kubegems/components/logicComponents/ContainerLog.vue';

  export default {
    name: 'Log',
    components: {
      ContainerLog,
    },
    data() {
      return {
        pod: null,
      };
    },
    mounted() {
      this.$nextTick(async () => {
        await this.podDetail();
        const item = {
          namespace: this.$route.query.namespace,
          name: this.$route.params.name,
          containers: this.pod.spec.containers.concat(
            this.pod.spec.initContainers
              ? this.pod.spec.initContainers.map((i) => {
                  return { ...i, showName: `${i.name} (init)` };
                })
              : [],
          ),
        };
        let container = this.pod.spec.containers[0].name;
        if (this.$route.query.container) container = this.$route.query.container;
        this.$refs.containerLog.init(container, item);
        this.$refs.containerLog.open();
      });
    },
    methods: {
      async podDetail() {
        const data = await getPodDetail(
          this.$route.query.cluster,
          this.$route.query.namespace,
          this.$route.params.name,
        );
        this.pod = data;
      },
    },
  };
</script>
