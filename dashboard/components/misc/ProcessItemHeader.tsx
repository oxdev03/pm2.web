import { Flex, Indicator, Text } from '@mantine/core';
import { useCallback } from 'react';
import { IProcess } from '@/types/server';
import { IconBrandCSharp, IconBrandGolang, IconBrandJavascript, IconBrandPhp, IconBrandPowershell, IconBrandPython, IconCode, IconCoffee, TablerIconsProps } from '@tabler/icons-react';

export default function ProcessItemHeader({ statusColor, interpreter, name }: { statusColor?: string; interpreter: IProcess['type']; name: string }) {
  const InterpreterIcon = useCallback(() => {
    switch (interpreter) {
      case 'node':
        return <IconBrandJavascript size="1.6rem" stroke={1.5} color="#F0DB4F" />;
      case 'python':
        return <IconBrandPython size="1.6rem" stroke={1.5} color="#3776AB" />;
      case 'php':
        return <IconBrandPhp size="1.6rem" stroke={1.5} color="#8892BF" />;
      case 'bash':
        return <IconBrandPowershell size="1.6rem" stroke={1.5} color="#5391FE" />;
      case 'go':
        return <IconBrandGolang size="1.6rem" stroke={1.5} color="#00ADD8" />;
      case 'dotnet':
        return <IconBrandCSharp size="1.6rem" stroke={1.5} color="#512BD4" />;
      case 'shell':
        return <IconBrandPowershell size="1.6rem" stroke={1.5} color="#5391FE" />;
      case 'java':
        return <IconCoffee size="1.6rem" stroke={1.5} color="#D5573B" />;
      default:
        return <IconCode size="1.6rem" stroke={1.5} color="#666666" />;
    }
  }, [interpreter]);

  return (
    <Flex align={'center'} rowGap={'10px'} columnGap={'5px'}>
      <Indicator color={statusColor || 'gray'} position="bottom-end" size={10} offset={5} zIndex={1}>
        <InterpreterIcon />
      </Indicator>
      <Text size="xl" weight={600}>
        {name}
      </Text>
    </Flex>
  );
}
