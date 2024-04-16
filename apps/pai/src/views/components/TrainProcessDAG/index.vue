<!--
 * kubegems-pai
 * Copyright (C) 2023  kubegems.io
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <v-card class="mt-3 card">
    <v-card-text>
      <VueOkrTree
        v-if="setTree.length > 0 && outputTree.length > 0"
        class="training-tree"
        current-lable-class-name="crrent-active-class"
        :data="outputTree"
        direction="horizontal"
        :left-data="setTree"
        only-both-tree
        :render-content="renderContent"
        :style="{
          height: `calc(100vh - ${230 * store.state.Scale}px - 13px)`,
          minHeight: `calc(100vh - ${230 * store.state.Scale}px - 13px)`,
        }"
      />
    </v-card-text>

    <ViewSet ref="viewer" />
  </v-card>
</template>

<script lang="tsx" setup>
  import { useStore } from '@kubegems/extension/store';
  import { PAI_DATASET_CATALOG_KEY, PAI_MODALSET_CATALOG_KEY } from '@kubegems/libs/constants/label';
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import { beautifyFloatNum, beautifyStorageUnit, deepCopy } from '@kubegems/libs/utils/helpers';
  import { ref, watch } from 'vue';
  import { VueOkrTree } from 'vue-okr-tree/lib/vue-okr-tree.umd.min.js';

  import 'vue-okr-tree/lib/vue-okr-tree.css';

  import { SetBase } from '../../../api/base';
  import { Job } from '../../../api/job';
  import { useI18n } from '../i18n';
  import ViewSet from '../ViewSet.vue';

  const props = withDefaults(
    defineProps<{
      job?: Job;
    }>(),
    {
      job: void 0,
    },
  );

  const store = useStore();
  const i18nLocal = useI18n();

  const setTree = ref([]);
  const outputTree = ref([]);

  const getMountList = async (): Promise<void> => {
    const data = await new Job(props.job).getMountListInJob();
    const [role] = data.roles;
    if (role && role.mounts) {
      const metrics = await new SetBase().getSetBucketMetrics(
        role.mounts.map((p) => {
          return p.status.bucket;
        }),
        { noprocessing: true },
      );

      role.mounts.forEach((p) => {
        p.status.size = beautifyStorageUnit(parseFloat(metrics.size[p.status.bucket] || '0'));
        p.status.count = beautifyFloatNum(parseInt(metrics.count[p.status.bucket] || '0'), 0);
      });

      const output = role.mounts.filter((item) => item.kind === 'output');
      const outputNode = output.map((item) => {
        return {
          id: `output-${item.name}`,
          ...item,
        };
      });
      const [rightJob] = outputTree.value;
      if (rightJob) {
        rightJob.children = outputNode;
      }

      const modelset = role.mounts.filter((item) => item.kind === 'modelset');
      setTree.value[0].models = modelset;
      outputTree.value[0].models = modelset;

      const other = role.mounts.filter((item) => ['output', 'modelset'].indexOf(item.kind) === -1);
      const otherNode = other.map((item) => {
        return {
          id: `${item.kind}-${item.name}`,
          ...item,
        };
      });
      const [job] = setTree.value;
      if (job) {
        job.children = otherNode;
      }
    }
    setTree.value = setTree.value.slice();
    outputTree.value = outputTree.value.slice();
  };

  const renderContent = (h, node) => {
    /* eslint-disable jsx-quotes */
    const _Offset = (item) => {
      const [top, right] = ['10px', '-4px'];
      let offset: any = {};
      offset = { class: {}, style: { top: top, right: right } };
      if (item.kind === 'output') {
        offset = { class: {}, style: { top: '8px', right: '4px' } };
      } else if (['dataset', 'codeset', 'modelset'].indexOf(item.kind) > -1) {
        offset = { class: {}, style: { top: '9px', right: '-1px' } };
      }
      return offset;
    };

    const jobStatus = {
      class: {
        'v-avatar': true,
        'mr-1': true,
        'kubegems__waiting-flashing': props.job?.status?.state?.phase === 'Pending',
      },
      style: {
        height: '10px',
        minWidth: '10px',
        width: '10px',
        marginTop: '-2px',
        backgroundColor: POD_STATUS_COLOR[props.job?.status?.state?.phase] || 'grey',
      },
    };

    const _Icon = (item) => {
      let icon = 'pai';
      if (item.kind === 'output') {
        icon = 'pai-output';
      } else if (item.kind === 'codeset') {
        icon = 'logos:git-icon';
      } else if (item.kind === 'modelset') {
        icon = item.labels?.[PAI_MODALSET_CATALOG_KEY];
      } else if (item.kind === 'dataset') {
        icon = item.labels?.[PAI_DATASET_CATALOG_KEY];
      } else if (item.kind === 'job') {
        icon = 'pai-task';
      } else if (item.kind === 'workspace') {
        icon = 'mdi:home';
      }
      return icon;
    };

    const _Card = (item) => {
      return (
        <v-card class="mx-auto rounded training_card__pos py-2 px-3" flat height="100%">
          <div class="text-h6 primary--text">
            <div class="float-left mr-2">
              <base-logo default-logo="pai" icon-name={_Icon(item)} width={24} ml={0} mt={1} />
            </div>
            <div class="float-left training_card__title">{item.name}</div>
            <div class="kubegems__clear-float" />
            <div class="text-left text-body-2">{item.targetPath}</div>
          </div>
          <v-divider />
          <v-list-item class="px-0">
            <v-list-item-content class="dag_card__content">{item.description}</v-list-item-content>
          </v-list-item>

          {['dataset', 'modelset', 'output', 'workspace'].indexOf(item.kind) > -1 ? (
            <v-card-actions class="px-0">
              <v-list-item-subtitle
                class="text-body-2 text--lighten-4 dag_card__desc dag_card__desc__wd text-left"
                min-height="48"
              >
                <v-icon color="orange" small class="mr-1">
                  mdi-chart-donut
                </v-icon>
                Size: {item?.status?.size || 0}
                <span class="mx-2" />
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-body-2 text--lighten-4 dag_card__desc dag_card__desc__wd text-left">
                <v-icon color="orange" small class="mr-1">
                  mdi-bucket
                </v-icon>
                Objects: {item?.status?.count || 0}
                <span class="mx-2" />
              </v-list-item-subtitle>
              <v-spacer />
              <v-spacer />
              <v-spacer />
              <v-list-item-subtitle class="text-body-2 text--lighten-4 dag_card__desc text-end">
                <button
                  type="button"
                  class="v-btn v-btn--text theme--light v-size--small primary--text px-1"
                  onClick={(e) => {
                    viewSet(item, e);
                  }}
                >
                  <span class="v-btn__content">{i18nLocal.t('operate.view')}</span>
                </button>
              </v-list-item-subtitle>
            </v-card-actions>
          ) : ['output'].indexOf(item.kind) > -1 ? (
            <v-card-actions class="px-0"></v-card-actions>
          ) : ['codeset'].indexOf(item.kind) > -1 ? (
            <v-card-actions class="px-0">
              <v-list-item-subtitle class="text-body-2 text--lighten-4 dag_card__desc dag_card__desc__wd text-left">
                <v-icon color="orange" small class="mr-1">
                  mdi-source-branch
                </v-icon>
                Branch: {item.config ? item.config.branch : '-'}
                <span class="mx-2" />
              </v-list-item-subtitle>
              <v-spacer />
              <v-spacer />
            </v-card-actions>
          ) : ['workspace'].indexOf(item.kind) > -1 ? (
            <v-card-actions class="px-0"></v-card-actions>
          ) : (
            ''
          )}

          <v-flex class="training_card__watermark-bg"></v-flex>
          <v-flex class="training_card__watermark font-weight-medium" style={_Offset(item).style}>
            {i18nLocal.t(`tip.${item.kind}`)}
          </v-flex>
        </v-card>
      );
    };

    return (
      <div>
        {node.data?.kind === 'job' ? (
          <div class="job">
            <div class="text-h6 primary--text">
              <div class="float-left mr-2">
                <base-logo default-logo="pai" icon-name={_Icon(node.data)} width={24} ml={0} mt={1} />
              </div>
              <div class="float-left">{node.data.name}</div>
              <div class="float-right text-body-2 kubegems--text" style="line-height:32px">
                <span class={jobStatus.class} style={jobStatus.style} />
                <span>{props.job?.status?.state?.phase}</span>
              </div>
              <div class="kubegems__clear-float" />
            </div>
            <div>
              {node.data?.models?.map((model) => (
                <div class="my-3">{_Card(model)}</div>
              ))}
            </div>
          </div>
        ) : (
          _Card(node.data)
        )}
      </div>
    );
  };

  const viewer = ref(null);
  const viewSet = (item: SetBase, e: Event): void => {
    viewer.value.open(e);
    viewer.value.init(item, i18nLocal.t(`tip.${item.kind}`) + ' ' + item.name);
  };

  watch(
    () => props.job,
    (newValue) => {
      if (newValue && newValue.name) {
        const node = [
          {
            id: 'job',
            ...newValue,
            kind: 'job',
            children: [],
          },
        ];
        setTree.value = [];
        setTree.value = setTree.value.concat(deepCopy(node));
        outputTree.value = [];
        outputTree.value = outputTree.value.concat(deepCopy(node));
        getMountList();
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>

<style lang="scss">
  .dag_card {
    min-height: 500px;

    &__desc {
      line-height: 24px;

      &__wd {
        min-width: 145px;
      }
    }

    &__content {
      max-height: 50px;
      overflow: auto;
      white-space: normal;
      word-break: break-word;
      font-size: 15px;
      color: rgba(0, 0, 0, 0.6);
      line-height: 22px;
      max-width: 340px;
      text-align: left;
    }
  }

  .training-tree {
    overflow-y: auto;
    overflow-x: auto;
  }

  .job {
    padding: 10px 15px;
    border: 2px solid #efefef;
    background-color: #efefef;
    border-radius: 8px;
  }

  // .horizontal .org-chart-node:not(.is-left-child-node)::before {
  //   margin-top: 1px;
  // }

  .org-chart-node-label-inner {
    padding: 0 !important;
    border-radius: 8px;
    box-shadow: 0 0 1px 0 rgb(27 19 19 / 10%);
    min-width: 350px;
  }

  .training_card {
    border: 2px solid var(--primary-color);

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 100px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: var(--primary-color);
      padding: 0;
    }

    &__watermark {
      position: absolute;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }

    &__title {
      max-width: 320px;
      word-break: break-word;
      white-space: break-spaces;
      text-overflow: ellipsis;
      overflow: hidden;
      text-align: left;
    }
  }

  .horizontal .org-chart-node:not(.is-left-child-node):not(.is-not-child):last-child::before {
    border-bottom: 0 solid #cccccc;
    border-radius: 0 0 0 5px;
    content: url('/icon/arrow.svg');
    top: 51%;
    transform: translate(-0%, -13%);
  }

  .horizontal .only-both-tree-node > .org-chart-node-label::before {
    content: url('/icon/arrow.svg');
    border-bottom: 0 solid #cccccc;
    position: absolute;
    top: 52%;
    transform: translate(-0%, -13%);
    right: 100%;
    height: 51%;
    width: 20px;
  }

  .horizontal .is-left-child-node::after,
  .horizontal .is-left-child-node::before {
    content: '';
    position: absolute;
    border-right: 2px solid #cccccc;
    right: -5px;
    width: 20px;
    height: 50%;
  }

  .horizontal .is-left-child-node::after {
    top: 50%;
    border-top: 2px solid #cccccc;
  }

  .horizontal .is-left-child-node:last-child::before {
    border-bottom: 2px solid #cccccc;
    border-radius: 0 0 5px 0;
    right: -5px;
  }

  .horizontal .org-chart-node-children::before,
  .horizontal .org-chart-node-left-children::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 50%;
    border-top: 2px solid #cccccc;
    width: 20px;
    height: 10px;
    margin-top: -3px;
  }

  .horizontal .org-chart-node-left-children::before {
    position: absolute;
    left: -10px;
    top: 46%;
    border-top: 0 solid #cccccc;
    width: 12px;
    height: 10px;
  }

  .messagetip {
    position: absolute;
    bottom: 45px;
    right: 15px;
    display: none !important;
    z-index: 99;
    max-width: 200px;
  }
  .message:hover .messagetip {
    display: block !important;
  }
</style>
