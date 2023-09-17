import { Flex, Paper, Text, useMantineColorScheme } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';

export default function ProcessItemMetric({ w, Icon, value }: { w?: string; Icon: React.ElementType<TablerIconsProps>; value: string | undefined }) {
  const { colorScheme } = useMantineColorScheme();

  const dark = colorScheme === 'dark';
  return (
    <Paper bg={dark ? 'dark.8' : 'gray.1'} radius="md" p={'4px'} px={'10px'}>
      <Flex align={'center'} justify={'space-between'} gap={'5px'} w={w || '50px'}>
        <Icon size="1.2rem" />
        <Text size="md">{value || ''}</Text>
      </Flex>
    </Paper>
  );
}
