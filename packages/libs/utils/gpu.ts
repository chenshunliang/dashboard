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
