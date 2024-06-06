export const deviceMap = {
  'nvidia.com/gpu': void 0,
  'huawei.com/Ascend910': void 0,
  'huawei.com/Ascend310': void 0,
};

export const gpuFilterCondition = (resource) => {
  return (
    resource.resourceName === 'volcano.sh/vgpu-memory' ||
    resource.resourceName === 'nvidia.com/gpu' ||
    resource.resourceName.startsWith('huawei.com')
  );
};

export const getGPUTotal = (limits) => {
  let total = 0;
  Object.keys(deviceMap).forEach((d) => {
    if (limits?.[d]) {
      total += parseInt(limits?.[d] || '0');
    }
  });
  return total;
};

export const getGpuType = (job: any) => {
  let _type = '';
  job?.config?.roles?.forEach((r) => {
    if (r?.skuDetails?.resources?.some((r) => r?.resourceName?.indexOf('huawei.com') > -1)) _type = 'npu';
    else if (r?.skuDetails?.resources?.some((r) => r?.resourceName?.indexOf('nvidia.com') > -1)) _type = 'gpu';
    else if (r?.skuDetails?.resources?.some((r) => r?.resourceName?.indexOf('volcano.sh/vgpu-memory') > -1))
      _type = 'gpu';
  });
  return _type;
};
