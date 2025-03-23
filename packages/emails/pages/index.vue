<script setup lang="ts">
import '~/assets/main.css'
import type { Component } from 'vue'

// Dynamically import all email components
const emailComponentModules = import.meta.glob('../components/emails/*.vue')

// Also import raw content for prop extraction
const emailComponentRaw = import.meta.glob('../components/emails/*.vue', { as: 'raw' })

// Create a record of component names to component imports
const emailComponents: Record<string, Component> = {}
const componentSources: Record<string, string> = {}

// Convert module paths to component names and store the async components
Object.entries(emailComponentModules).forEach(([path, importFn]) => {
  // Extract component name from path
  // For example: '../components/emails/invite.vue' -> 'Invite'
  const fileName = path.split('/').pop() || ''
  const componentName = fileName.replace('.vue', '')
  
  // Only add if it has a name (safety check)
  if (componentName) {
    // Capitalize first letter for consistent naming
    const formattedName = componentName.charAt(0).toUpperCase() + componentName.slice(1)
    emailComponents[formattedName] = defineAsyncComponent(importFn as any)
    
    // Load raw source for this component asynchronously
    emailComponentRaw[path]().then(source => {
      componentSources[formattedName] = source
    })
  }
})

// State management
const selectedComponent = ref('')
const componentProps = ref<Record<string, any>>({})
const componentPropTypes = ref<Record<string, string>>({})
const forceRender = ref(0)
const previewMode = ref<'desktop' | 'mobile'>('desktop')

// Get available component names for the select dropdown
const availableComponents = computed(() => Object.keys(emailComponents))

// Get the currently selected component
const CurrentComponent = computed(() => {
  if (!selectedComponent.value || !emailComponents[selectedComponent.value]) {
    return null
  }
  return emailComponents[selectedComponent.value]
})

// Watch for changes in any prop to force component update
watch(componentProps, () => {
  forceRender.value++
}, { deep: true })

// Extract props from component source code
function extractPropsFromSource(source: string): Record<string, string> {
  // First try to find the interface definition
  const interfaceMatch = source.match(/interface\s+(\w+Props)\s*\{([^}]+)\}/s)
  if (interfaceMatch) {
    const interfaceContent = interfaceMatch[2]
    // Parse each property definition, including optional props with ?
    const propDefs = interfaceContent.match(/\s*(\w+)\s*\??\s*:\s*(\w+)/g) || []
    return propDefs.reduce((props, def) => {
      const [, name, type] = def.match(/\s*(\w+)\s*\??\s*:\s*(\w+)/) || []
      if (name && type) {
        props[name] = type
      }
      return props
    }, {} as Record<string, string>)
  }
  
  // If no interface, try to find defineProps
  const propsMatch = source.match(/defineProps<\{([^}]+)\}>/) || source.match(/defineProps\(\{([^}]+)\}\)/)
  if (propsMatch) {
    const propsContent = propsMatch[1]
    // Parse each property definition, including optional props
    const propDefs = propsContent.match(/\s*(\w+)\s*\??\s*:(?:\s*\w+)?\s*(\w+)/g) || []
    return propDefs.reduce((props, def) => {
      const [, name, type] = def.match(/\s*(\w+)\s*\??\s*:(?:\s*\w+)?\s*(\w+)/) || []
      if (name) {
        props[name] = type || 'string'
      }
      return props
    }, {} as Record<string, string>)
  }
  
  return {}
}

// Generate intelligent default values based on prop types and names
function generateDefaultValues(propTypes: Record<string, string>): Record<string, any> {
  return Object.entries(propTypes).reduce((acc, [key, type]) => {
    switch (type.toLowerCase()) {
      case 'string':
        // Generate smart defaults based on property name patterns
        if (key.includes('email')) {
          acc[key] = 'user@example.com'
        } else if (key.includes('name')) {
          acc[key] = 'Example Name'
        } else if (key.includes('link') || key.includes('url')) {
          acc[key] = 'https://example.com/resource/123'
        } else if (key.includes('title')) {
          acc[key] = 'Sample Title'
        } else if (key.includes('description')) {
          acc[key] = 'This is a sample description for the email component.'
        } else if (key.includes('message')) {
          acc[key] = 'This is a sample message content.'
        } else if (key.includes('code') || key.includes('token')) {
          acc[key] = '123456'
        } else {
          acc[key] = `Sample ${key}`
        }
        break
      case 'number':
        acc[key] = 0
        break
      case 'boolean':
        acc[key] = false
        break
      case 'array':
      case 'any[]':
      case 'string[]':
        acc[key] = []
        break
      case 'object':
      case 'record':
        acc[key] = {}
        break
      default:
        acc[key] = ''
    }
    return acc
  }, {} as Record<string, any>)
}

// Handle component selection
async function selectComponent(name: string) {
  selectedComponent.value = name
  
  // Reset props
  componentProps.value = {}
  componentPropTypes.value = {}
  
  // Get raw source code for the selected component
  let props: Record<string, string> = {}
  
  if (componentSources[name]) {
    // Extract props from the source code
    props = extractPropsFromSource(componentSources[name])
  }
  
  // Update the UI with extracted props
  componentPropTypes.value = props
  componentProps.value = generateDefaultValues(props)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Email Preview Tool
        </h1>
        <p class="mt-2 text-sm text-gray-600">Test and preview email templates with custom props</p>
      </header>
      
      <!-- Component selector -->
      <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 mb-2">Select Email Template</label>
        <div class="relative">
          <select 
            v-model="selectedComponent" 
            @change="selectComponent(selectedComponent)"
            class="w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
          >
            <option value="" disabled selected>Select a template</option>
            <option v-for="component in availableComponents" :key="component" :value="component">
              {{ component }}
            </option>
          </select>
        </div>
      </div>
      
      <div v-if="selectedComponent" class="transition-all duration-200">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Props editor -->
          <div class="col-span-1 lg:col-span-4 xl:col-span-3 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-medium text-gray-900">Template Props</h2>
              <button 
                v-if="Object.keys(componentPropTypes).length" 
                @click="componentProps = generateDefaultValues(componentPropTypes)"
                class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
              >
                Reset
              </button>
            </div>
            
            <div v-if="Object.keys(componentPropTypes).length > 0" class="space-y-4">
              <div v-for="(type, propName) in componentPropTypes" :key="propName" class="space-y-1">
                <label :for="propName" class="block text-sm font-medium text-gray-700">
                  {{ propName }}
                  <span class="text-xs text-gray-500 ml-1">({{ type }})</span>
                </label>
                
                <textarea 
                  v-if="type.toLowerCase() === 'string' && (propName.includes('description') || propName.includes('message'))"
                  v-model="componentProps[propName]" 
                  :id="propName"
                  rows="3"
                  class="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  :placeholder="`Enter ${propName}`"
                ></textarea>
                
                <input 
                  v-else-if="type.toLowerCase() === 'number'"
                  v-model.number="componentProps[propName]" 
                  :id="propName"
                  type="number"
                  class="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  :placeholder="`Enter ${propName}`"
                />
                
                <div v-else-if="type.toLowerCase() === 'boolean'" class="flex items-center">
                  <input 
                    v-model="componentProps[propName]" 
                    :id="propName"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label :for="propName" class="ml-2 text-sm text-gray-700">Enabled</label>
                </div>
                
                <input 
                  v-else
                  v-model="componentProps[propName]" 
                  :id="propName"
                  class="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  :placeholder="`Enter ${propName}`"
                />
              </div>
            </div>
            
            <div v-else class="py-8 text-center text-gray-500 italic text-sm">
              No props available for this template
            </div>
          </div>
          
          <!-- Email preview -->
          <div class="col-span-1 lg:col-span-8 xl:col-span-9 space-y-4">
            <!-- Preview controls -->
            <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-2 items-center justify-between">
              <div class="font-medium text-sm text-gray-700">
                {{ selectedComponent }} Preview
              </div>
              <div class="flex items-center gap-2">
                <button 
                  @click="previewMode = 'mobile'" 
                  :class="[
                    'text-xs border hover:bg-gray-50 px-3 py-1.5 rounded transition-colors',
                    previewMode === 'mobile' 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-medium' 
                      : 'bg-white text-gray-700 border-gray-300'
                  ]"
                >
                  Mobile
                </button>
                <button 
                  @click="previewMode = 'desktop'" 
                  :class="[
                    'text-xs border hover:bg-gray-50 px-3 py-1.5 rounded transition-colors',
                    previewMode === 'desktop' 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-medium' 
                      : 'bg-white text-gray-700 border-gray-300'
                  ]"
                >
                  Desktop
                </button>
              </div>
            </div>

            <!-- Actual preview -->
            <div class="bg-gray-100 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-[#f5f5f5] px-3 py-2 border-b border-gray-200 flex items-center text-xs text-gray-500">
                <div class="flex-1">From: noreply@example.com</div>
                <div class="flex-1">To: recipient@example.com</div>
                <div class="flex-none">
                  <span class="inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800">Preview</span>
                </div>
              </div>

              <div 
                class="bg-white py-8 overflow-auto transition-all duration-300"
                :class="{
                  'max-w-full': previewMode === 'desktop',
                  'max-w-[414px] mx-auto border-x border-gray-200': previewMode === 'mobile'
                }"
              >
                <div v-if="CurrentComponent" class="transition-opacity duration-300">
                  <component 
                    :is="CurrentComponent" 
                    v-bind="componentProps"
                    :key="forceRender"
                  />
                </div>

                <div v-else class="p-10 text-center text-gray-500">
                  <p class="text-lg mb-3">📧</p>
                  <p>Select a template to preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 bg-white rounded-lg shadow-sm">
        <p class="text-2xl mb-4">📧</p>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Select an Email Template</h3>
        <p class="text-sm text-gray-500 max-w-md mx-auto">Choose a template from the dropdown above to preview and customize email content</p>
      </div>
    </div>
  </div>
</template>
